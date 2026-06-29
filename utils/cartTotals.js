function calculateCartTotals(cart) {
    let subtotal = 0;
    let productDiscount = 0;

    cart.forEach((item) => {
        if (!item.product || !item.quantity) return;

        subtotal += item.product.price * item.quantity;

        if (item.product.discount) {
            productDiscount += item.product.discount * item.quantity;
        }
    });

    const extraDiscount = subtotal > 2000 ? Math.floor(subtotal * 0.1) : 0;
    const deliveryFee = subtotal > 1500 ? 0 : 80;
    const platformFee = subtotal > 1500 ? 0 : 20;

    const total =
        subtotal - productDiscount - extraDiscount + deliveryFee + platformFee;

    return {
        subtotal,
        productDiscount,
        extraDiscount,
        deliveryFee,
        platformFee,
        total,
    };
}

module.exports = calculateCartTotals;
