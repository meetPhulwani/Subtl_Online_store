(function () {
    var payBtn = document.getElementById('payBtn');
    if (!payBtn || payBtn.disabled) return;

    var form = document.getElementById('checkoutForm');
    var verifyForm = document.getElementById('verifyForm');

    function setLoading(loading) {
        var text = payBtn.querySelector('.btn-text');
        var loader = payBtn.querySelector('.btn-loader');
        payBtn.disabled = loading;
        if (text) text.classList.toggle('hide', loading);
        if (loader) loader.classList.toggle('hide', !loading);
    }

    function getField(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }

    function validate() {
        var fields = [
            { id: 'fullName', label: 'Full name' },
            { id: 'phone', label: 'Phone' },
            { id: 'addressLine', label: 'Address' },
            { id: 'city', label: 'City' },
            { id: 'pincode', label: 'Pincode' },
        ];

        for (var i = 0; i < fields.length; i++) {
            var val = getField(fields[i].id);
            if (!val) {
                window.SubtlUI && SubtlUI.toast(fields[i].label + ' is required', 'error');
                document.getElementById(fields[i].id).focus();
                return false;
            }
        }

        var phone = getField('phone');
        if (!/^[0-9]{10}$/.test(phone)) {
            window.SubtlUI && SubtlUI.toast('Enter a valid 10-digit phone number', 'error');
            document.getElementById('phone').focus();
            return false;
        }

        var pincode = getField('pincode');
        if (!/^[0-9]{6}$/.test(pincode)) {
            window.SubtlUI && SubtlUI.toast('Enter a valid 6-digit pincode', 'error');
            document.getElementById('pincode').focus();
            return false;
        }

        return true;
    }

    payBtn.addEventListener('click', async function () {
        if (!validate()) return;

        setLoading(true);

        try {
            var res = await fetch('/checkout/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: getField('fullName'),
                    phone: getField('phone'),
                    addressLine: getField('addressLine'),
                    city: getField('city'),
                    pincode: getField('pincode'),
                }),
            });

            var data = await res.json();

            if (!res.ok || data.error) {
                window.SubtlUI && SubtlUI.toast(data.error || 'Could not start payment', 'error');
                setLoading(false);
                return;
            }

            var options = {
                key: data.keyId,
                amount: data.amount,
                currency: data.currency,
                name: data.name,
                description: data.description,
                order_id: data.orderId,
                prefill: data.prefill,
                theme: { color: '#0a0a0a' },
                handler: function (response) {
                    document.getElementById('razorpay_order_id').value = response.razorpay_order_id;
                    document.getElementById('razorpay_payment_id').value = response.razorpay_payment_id;
                    document.getElementById('razorpay_signature').value = response.razorpay_signature;
                    verifyForm.submit();
                },
                modal: {
                    ondismiss: function () {
                        setLoading(false);
                    },
                },
            };

            var rzp = new Razorpay(options);

            rzp.on('payment.failed', function () {
                window.location.href = '/payment/failed';
            });

            rzp.open();
        } catch (err) {
            console.error(err);
            window.SubtlUI && SubtlUI.toast('Payment could not be initiated', 'error');
            setLoading(false);
        }
    });
})();
