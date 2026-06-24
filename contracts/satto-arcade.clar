(define-constant PAYOUT-DENOMINATOR u100)

(define-constant MODE-NORMAL u0)
(define-constant MODE-HARD u1)

(define-constant OUTCOME-LOSE u0)
(define-constant OUTCOME-DRAW u1)
(define-constant OUTCOME-WIN u2)

(define-constant STALE-TIMEOUT u6)

(define-constant ERR-NOT-OWNER (err u100))
(define-constant ERR-NOT-RELAYER (err u101))
(define-constant ERR-STAKE-TOO-LOW (err u102))
(define-constant ERR-GAME-EXISTS (err u103))
(define-constant ERR-NO-GAME (err u104))
(define-constant ERR-ALREADY-SETTLED (err u105))
(define-constant ERR-NOT-STALE-YET (err u106))
(define-constant ERR-BAD-OUTCOME (err u107))
(define-constant ERR-BAD-MODE (err u108))
(define-constant ERR-HOUSE-CANNOT-COVER (err u109))
(define-constant ERR-EXCEEDS-HOUSE (err u110))
(define-constant ERR-PAYOUT-TOO-LOW (err u111))
(define-constant ERR-NO-VALUE (err u113))

(define-data-var owner principal tx-sender)
(define-data-var relayer principal tx-sender)
(define-data-var house-balance uint u0)
(define-data-var min-stake uint u1)

(define-map payout-numerator uint uint)
(map-set payout-numerator MODE-NORMAL u200)
(map-set payout-numerator MODE-HARD u300)

(define-map games
  (buff 32)
  {
    player: principal,
    stake: uint,
    created-at: uint,
    mode: uint,
    settled: bool,
  }
)

(define-read-only (get-owner) (var-get owner))
(define-read-only (get-relayer) (var-get relayer))
(define-read-only (get-house-balance) (var-get house-balance))
(define-read-only (get-min-stake) (var-get min-stake))

(define-read-only (get-payout (mode uint))
  (default-to u0 (map-get? payout-numerator mode))
)

(define-read-only (get-game (game-id (buff 32)))
  (map-get? games game-id)
)

(define-public (stake
    (game-id (buff 32))
    (mode uint)
    (amount uint)
  )
  (let (
      (numerator (unwrap! (map-get? payout-numerator mode) ERR-BAD-MODE))
      (max-winnings (- (/ (* amount numerator) PAYOUT-DENOMINATOR) amount))
    )
    (asserts! (>= amount (var-get min-stake)) ERR-STAKE-TOO-LOW)
    (asserts! (is-none (map-get? games game-id)) ERR-GAME-EXISTS)
    (asserts! (>= (var-get house-balance) max-winnings) ERR-HOUSE-CANNOT-COVER)

    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))

    (map-set games game-id {
      player: tx-sender,
      stake: amount,
      created-at: burn-block-height,
      mode: mode,
      settled: false,
    })
    (print {
      event: "staked",
      game-id: game-id,
      player: tx-sender,
      stake: amount,
      mode: mode,
    })
    (ok true)
  )
)

(define-public (claim-stale-refund (game-id (buff 32)))
  (let (
      (game (unwrap! (map-get? games game-id) ERR-NO-GAME))
      (player (get player game))
      (amount (get stake game))
    )
    (asserts! (not (get settled game)) ERR-ALREADY-SETTLED)
    (asserts! (>= burn-block-height (+ (get created-at game) STALE-TIMEOUT))
      ERR-NOT-STALE-YET
    )
    (map-set games game-id (merge game { settled: true }))
    (try! (as-contract (stx-transfer? amount tx-sender player)))
    (print {
      event: "stale-refunded",
      game-id: game-id,
      player: player,
      stake: amount,
    })
    (ok true)
  )
)

(define-public (settle
    (game-id (buff 32))
    (outcome uint)
  )
  (let (
      (game (unwrap! (map-get? games game-id) ERR-NO-GAME))
      (player (get player game))
      (stake-amount (get stake game))
      (numerator (get-payout (get mode game)))
    )
    (asserts! (is-eq tx-sender (var-get relayer)) ERR-NOT-RELAYER)
    (asserts! (not (get settled game)) ERR-ALREADY-SETTLED)
    (asserts! (<= outcome OUTCOME-WIN) ERR-BAD-OUTCOME)

    (map-set games game-id (merge game { settled: true }))

    (if (is-eq outcome OUTCOME-WIN)
      (let ((payout (/ (* stake-amount numerator) PAYOUT-DENOMINATOR)))
        (var-set house-balance (- (var-get house-balance) (- payout stake-amount)))
        (try! (as-contract (stx-transfer? payout tx-sender player)))
        (print { event: "settled", game-id: game-id, player: player, outcome: outcome, payout: payout })
        (ok payout)
      )
      (if (is-eq outcome OUTCOME-DRAW)
        (begin
          (try! (as-contract (stx-transfer? stake-amount tx-sender player)))
          (print { event: "settled", game-id: game-id, player: player, outcome: outcome, payout: stake-amount })
          (ok stake-amount)
        )
        (begin
          (var-set house-balance (+ (var-get house-balance) stake-amount))
          (print { event: "settled", game-id: game-id, player: player, outcome: outcome, payout: u0 })
          (ok u0)
        )
      )
    )
  )
)

(define-public (fund-house (amount uint))
  (begin
    (asserts! (> amount u0) ERR-NO-VALUE)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set house-balance (+ (var-get house-balance) amount))
    (print { event: "house-funded", from: tx-sender, amount: amount })
    (ok true)
  )
)

(define-public (withdraw-house (amount uint))
  (let ((recipient (var-get owner)))
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (asserts! (<= amount (var-get house-balance)) ERR-EXCEEDS-HOUSE)
    (var-set house-balance (- (var-get house-balance) amount))
    (try! (as-contract (stx-transfer? amount tx-sender recipient)))
    (print { event: "house-withdrawn", to: recipient, amount: amount })
    (ok true)
  )
)

(define-public (set-relayer (new-relayer principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (var-set relayer new-relayer)
    (print { event: "relayer-changed", relayer: new-relayer })
    (ok true)
  )
)

(define-public (set-min-stake (new-min uint))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (var-set min-stake new-min)
    (print { event: "min-stake-changed", min-stake: new-min })
    (ok true)
  )
)

(define-public (set-payout
    (mode uint)
    (numerator uint)
  )
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (asserts! (or (is-eq mode MODE-NORMAL) (is-eq mode MODE-HARD)) ERR-BAD-MODE)
    (asserts! (>= numerator PAYOUT-DENOMINATOR) ERR-PAYOUT-TOO-LOW)
    (map-set payout-numerator mode numerator)
    (print { event: "payout-changed", mode: mode, numerator: numerator })
    (ok true)
  )
)

(define-public (transfer-ownership (new-owner principal))
  (begin
    (asserts! (is-eq tx-sender (var-get owner)) ERR-NOT-OWNER)
    (var-set owner new-owner)
    (print { event: "ownership-transferred", owner: new-owner })
    (ok true)
  )
)
