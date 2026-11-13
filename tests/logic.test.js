const P = require('../assets/pathao.js'), R = P.DEFAULT_RATES;
let f = 0; const eq = (a, b, m) => { if (a !== b) { f++; console.log('FAIL', m, 'got', a, 'want', b); } else console.log('ok  ', m); };
// courier tiers
eq(P.courier(R, 'city', 0.4), 60, 'city ≤0.5'); eq(P.courier(R, 'city', 0.5), 60, 'city =0.5'); eq(P.courier(R, 'city', 0.51), 70, 'city >0.5');
eq(P.courier(R, 'dhaka', 1), 130, 'dhaka 1kg'); eq(P.courier(R, 'dhaka', 1.2), 170, 'dhaka 1.2kg');
eq(P.courier(R, 'dhaka', 2), 170, 'dhaka 2kg'); eq(P.courier(R, 'dhaka', 2.1), 195, 'dhaka 2.1kg (+25)'); eq(P.courier(R, 'dhaka', 3.5), 220, 'dhaka 3.5kg (+2*25)');
eq(P.courier(R, 'city', 2.1), 105, 'city 2.1kg (+15)'); eq(P.courier(R, 'other', 1.5), 180, 'other 1.5kg'); eq(P.courier(R, 'other', 0), 0, 'zero kg');
// guide example
let o = P.order(R, { items: [{ qty: 2, price: 799, cost: 650 }], route: 'dhaka', kg: 1.2, delivery: 'customer', codBase: 'product' });
eq(o.product, 1598, 'product'); eq(o.cod, 1768, 'cod'); eq(o.codFee, 15.98, 'cod fee 1% of product'); eq(o.payout, 1582.02, 'payout');
eq(o.profit, 1598 + 170 - 170 - 15.98 - 1300, 'profit'); 
// total base
o = P.order(R, { items: [{ qty: 1, price: 1000, cost: 0 }], route: 'city', kg: 0.5, delivery: 'customer', codBase: 'total' });
eq(o.cod, 1060, 'cod total'); eq(o.codFee, 10.6, 'cod fee on total');
// free delivery: you bear courier
o = P.order(R, { items: [{ qty: 1, price: 799, cost: 650 }], route: 'city', kg: 0.6, delivery: 'free', codBase: 'product' });
eq(o.chargeToCustomer, 0, 'free: customer pays 0'); eq(o.cod, 799, 'free: cod'); eq(o.profit, P.r2(799 - 70 - 7.99 - 650), 'free: profit');
// advance covers all → no COD, no COD fee
o = P.order(R, { items: [{ qty: 1, price: 799, cost: 650 }], route: 'city', kg: 0.6, delivery: 'customer', advance: 869, codBase: 'product' });
eq(o.cod, 0, 'fully prepaid cod 0'); eq(o.codFee, 0, 'fully prepaid no fee'); eq(o.received, P.r2(869 - 70), 'prepaid received');
// discount, extras, return
o = P.order(R, { items: [{ qty: 1, price: 800, cost: 600 }], discount: 50, route: 'city', kg: 0.5, delivery: 'customer', packing: 10, adCost: 20, returnCharge: 60, codBase: 'product' });
eq(o.product, 750, 'discount applied'); eq(o.returnLoss, 90, 'return loss = return charge + extras');
// suggestPrice round trip: profit at suggested price ≥ target
[['product', 'customer'], ['total', 'customer'], ['product', 'free']].forEach(([cb, dl]) => {
  const p = { cost: 650, packing: 10, adCost: 20, route: 'dhaka', kg: 0.6, delivery: dl, target: 150, codBase: cb };
  const s = P.suggestPrice(R, p);
  const r = P.order(R, { items: [{ qty: 1, price: s.price, cost: 650 }], route: 'dhaka', kg: 0.6, delivery: dl, packing: 10, adCost: 20, codBase: cb });
  eq(r.profit >= 150 - 0.01 && r.profit < 152, true, 'suggest ' + cb + '/' + dl + ' profit=' + r.profit);
});
eq(P.nice(790), 799, 'nice 790'); eq(P.nice(799), 799, 'nice 799'); eq(P.nice(800), 809, 'nice 800');
console.log(f ? f + ' FAILED' : 'ALL PASSED'); process.exit(f ? 1 : 0);
