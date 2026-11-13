/* Pathao charge logic — pure functions, no DOM. Works in browser (window.Pathao) and Node (require). */
(function (root) {
  // Source: Pathao Support (merchant location: Chattogram). Editable from the calculator page.
  var DEFAULT_RATES = {
    routes: {
      city:  { label: 'চট্টগ্রাম শহর → চট্টগ্রাম শহর', tiers: [60, 70, 90],    extra: 15 },
      dhaka: { label: 'চট্টগ্রাম → ঢাকা',               tiers: [110, 130, 170], extra: 25 },
      other: { label: 'চট্টগ্রাম → অন্য জেলা',          tiers: [120, 145, 180], extra: 25 }
    },
    codPct: 1
  };

  function n(x) { x = parseFloat(x); return isFinite(x) ? x : 0; }
  function r2(x) { return Math.round(x * 100) / 100; }

  // Courier charge by route and weight (kg). Tiers: ≤0.5, ≤1, ≤2; beyond 2kg each started extra kg adds `extra`.
  function courier(rates, route, kg) {
    var r = rates.routes[route];
    if (!r) return 0;
    kg = n(kg);
    if (kg <= 0) return 0;
    if (kg <= 0.5) return r.tiers[0];
    if (kg <= 1) return r.tiers[1];
    if (kg <= 2) return r.tiers[2];
    return r.tiers[2] + Math.ceil(kg - 2) * r.extra;
  }

  // COD charge: pct of base. base = 'product' (default, as per Pathao note) or 'total' (full amount collected).
  function codFee(rates, codAmount, productTotal, base) {
    if (n(codAmount) <= 0) return 0;
    var b = base === 'total' ? n(codAmount) : n(productTotal);
    return r2(b * rates.codPct / 100);
  }

  /* o: {items:[{qty,price,cost}], discount, route, kg, delivery:'customer'|'free'|'custom', customCharge,
         advance, codBase, packing, adCost, returnCharge} */
  function order(rates, o) {
    var items = o.items || [], gross = 0, cost = 0, pcs = 0;
    items.forEach(function (i) {
      gross += n(i.qty) * n(i.price); cost += n(i.qty) * n(i.cost); pcs += n(i.qty);
    });
    var discount = n(o.discount);
    var product = Math.max(0, gross - discount);
    var cour = courier(rates, o.route, o.kg);
    var charge = o.delivery === 'free' ? 0 : o.delivery === 'custom' ? n(o.customCharge) : cour;
    var advance = n(o.advance);
    var cod = Math.max(0, product + charge - advance);          // collected by Pathao from customer
    var fee = codFee(rates, cod, product, o.codBase);
    var extra = n(o.packing) + n(o.adCost);
    var payout = cod - cour - fee;                                // Pathao sends this to you
    var received = advance + payout;                              // everything you actually get
    var profit = product + charge - cour - fee - cost - extra;
    return {
      pcs: pcs, gross: gross, discount: discount, product: product, productCost: cost,
      courier: cour, chargeToCustomer: charge, advance: advance, cod: cod, codFee: fee,
      deliveryCost: r2(cour + fee), payout: r2(payout), received: r2(received), extra: extra,
      profit: r2(profit), margin: product > 0 ? r2(profit / product * 100) : 0,
      returnLoss: n(o.returnCharge) > 0 ? r2(n(o.returnCharge) + extra) : null
    };
  }

  // Minimum selling price (per order, one product line) for a target profit. Returns {price, ...}
  function suggestPrice(rates, p) {
    var pct = rates.codPct / 100, cour = courier(rates, p.route, p.kg);
    var charge = p.delivery === 'free' ? 0 : p.delivery === 'custom' ? n(p.customCharge) : cour;
    var fixed = n(p.cost) + n(p.packing) + n(p.adCost) + cour - charge + n(p.target);
    // profit = P + charge - cour - fee - cost - extra ; fee = pct*P (product base) or pct*(P+charge) (total base)
    var price = p.codBase === 'total' ? (fixed + pct * charge) / (1 - pct) : fixed / (1 - pct);
    return { price: Math.ceil(price), exact: r2(price), courier: cour, charge: charge };
  }

  // Next price ending in 9 at or above x (799, 849 …) — common retail price style.
  function nice(x) { return Math.ceil((x + 1) / 10) * 10 - 1; }

  var api = { DEFAULT_RATES: DEFAULT_RATES, courier: courier, codFee: codFee, order: order,
              suggestPrice: suggestPrice, nice: nice, n: n, r2: r2 };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.Pathao = api;
})(typeof window !== 'undefined' ? window : this);
