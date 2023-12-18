var express = require("express");
var router = express.Router();
var supabaseInstance = require("../../services/supabaseClient").supabase;

router.post("/getAllOutletPayment", async (req, res) => {
    const { startDate, endDate, searchText } = req.body;
    try {
        let query = supabaseInstance.rpc('get_all_outlet_order_payment', { start_date: startDate, end_date: endDate });

        if (searchText) {
            query = query.ilike('outletname', `%${searchText}%`)
        }

        const { data, error } = await query;

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/getOutletDashboard", async (req, res) => {
    const { outletId, startDate, endDate } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_single_outlet_order_dashboard', { outlet_id: outletId, start_date: startDate, end_date: endDate });

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/getOutletOrderDetails", async (req, res) => {
    const { outletId, startDate, endDate } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_single_outlet_order_details', { outlet_id: outletId, start_date: startDate, end_date: endDate });

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/getOutletOrderDateWise", async (req, res) => {
    const { outletId, targateDate } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_admin_outlet_order', { outlet_id: outletId, target_date: targateDate });

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/getAdminFinance", async (req, res) => {
    const { start_date, end_date, cities, campuses, outlets } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_all_outlet_finance', { start_date, end_date, cities: cities || null, campuses: campuses || null, outlets: outlets || null });

        if (data) {
            res.status(200).json({
                success: true,
                data: data.filter(item => item.outletid !== null)
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/getAdminFinanceDashboard", async (req, res) => {
    const { start_date, end_date, outlets } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_super_admin_finance_dashboard', { start_date, end_date, outlets: outlets || null });

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});


router.post("/getAdminFinanceOrderReport", async (req, res) => {
    const { start_date, end_date, outletId } = req.body;
    try {
        const { data, error } = await supabaseInstance.rpc('get_all_outlet_order_report_level', { start_date, end_date, outlet_id: outletId });

        if (data) {
            res.status(200).json({
                success: true,
                data: data
            });
        } else {
            throw error
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

router.post("/orderLevelExcelSheet", async (req, res) => {
    const { start_date, end_date, outletId } = req.body;
    try {
        // const { data, error } = await supabaseInstance.rpc('order_level_excel_sheet_query', { start_date, end_date, outlet_id: outletId });
        const { data, error } = await supabaseInstance.rpc('order_level_excel_sheet_query', {});

        if (data) {

            let _data = [
                ["", "", "", "", "", "", "", "(1)", "(2)", "(3)", "(CF)", "(4)", "(5)", "(A)", "(6)", "(7)", "(8)", "(9)", "(10)", "(11)", "(12)", "(13)", "(14)", "(15)", "(16)", "(17)", "(18)", "(19)", "(20)", "(C)", "(D)", "(E)"],
                [
                    "S.No.",
                    "Order ID",
                    "Order Date (Timestamp)",
                    "Restaurant Name",
                    "Restaurant ID",
                    "Discount Construct [X% off upto INR X (Date Range Applicable)]",
                    "Order type (Take Away/Dine In/Delivery)",
                    "Subtotal (items base price)",
                    "Packaging charge",
                    "Delivery charge",
                    "Convenience Fee % (Customer)",
                    "Convenience Fee Value = CF% of (1)+(2)+(3)",
                    "Restaurant discount [Promo]",
                    "Net bill value [(1) + (2) + (3) + (4) - (5)]",
                    "Total Food GST collected from customers = 5% of (1)",
                    "Food GST retained by MealPe - Amount of tax paid by MealPe under section 9(5)",
                    "Gross sales [(A) + (6)]",
                    "Total Merchant Amount [(B) - (7)-(4)]",
                    "Commissionable amount [(B) - (6) - (4)]",
                    "Commission % (Vendor)",
                    "Commission value = Comm% of (10)",
                    "Payment mechanism fee",
                    "Amount Applicable for GST on Packaging&Delivery Charges [ (2) + (3) ]",
                    "Applicable amount for 9(5) = (1) Food Base Price",
                    "Taxes on MealPe fees [ (4)+(12)+(13) ] * 18%",
                    "GST on Packaging and Delivery = 18% of (14)",
                    "TCS IGST amount",
                    "TDS 194O amount. = 1% of [(9)]",
                    "Credit note/(Debit Note) adjustment",
                    "Net Deductions [(4)+(12)+(13)+(16)+(17)+(18)+(19)+(20)]",
                    "Net Additions",
                    
                    "Order level Payout(B) - (C) + (D) - (7)"
                ]
            ]

            data.forEach((element, index) => {
                let _arr = [];
                
                const A = Number(element['Subtotal']) + Number(element['Packaging charge']) + Number(element['Delivery charge']) - Number(element['Restaurant discount']);
                const B = A + Number(element['Total Food GST collected from customers']);

                const _9  = B - Number(element['Total Food GST collected from customers']) - Number(element['Convenience Fee Value']);
                const _14 = Number(element['Packaging charge']) + Number(element['Delivery charge']);
                const _16 = +Number(0.18 * (Number(element['Convenience Fee Value']) + Number(element['Commission value']) + 0)).toFixed(2);
                const _17 = +Number(0.18 * _14).toFixed(2);
                const _19 = +Number(0.01 * _9).toFixed(2);

                const C = Number(element['Convenience Fee Value']) + Number(element['Commission value']) + 0 + _16 + _17 + 0 + _19 + 0;

                const E = (B - C) + (0 - Number(element['Total Food GST collected from customers']));

                _arr.push(index + 1);
                _arr.push(element['Order ID']);
                _arr.push(element['Restaurant Name']);
                _arr.push(element['Restaurant ID']);
                _arr.push(element['Discount Construct']);
                _arr.push(element['Order type']);
                _arr.push(element['Restaurant']);
                _arr.push(element['Subtotal']);
                _arr.push(element['Packaging charge']);
                _arr.push(element['Delivery charge']);
                _arr.push(element['Convenience Fee %']);
                _arr.push(element['Convenience Fee Value']);
                _arr.push(element['Restaurant discount']);
                _arr.push(A);
                _arr.push(element['Total Food GST collected from customers']);
                _arr.push(element['Total Food GST collected from customers']);
                _arr.push(B);
                _arr.push(_9);
                _arr.push(B - element['Total Food GST collected from customers'] - element['Convenience Fee Value']);
                _arr.push(element['Commission %']);
                _arr.push(element['Commission value']);
                _arr.push(element[0]); //* Payment mechanism fee
                _arr.push(_14);
                _arr.push(element['Subtotal']);
                _arr.push(_16);
                _arr.push(_17);
                _arr.push(""); //* TCS IGST amount
                _arr.push(_19); //* TDS 194O amount. = 1% of [(9)]
                _arr.push(""); //* Credit note/(Debit Note) adjustment
                _arr.push(C);
                _arr.push(""); //* Net Additions
                _arr.push(E);

                _data.push(_arr);
            });


            res.status(200).json({
                success: true,
                data: _data
            });
        } else {
            throw error;
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, error: error });
    }
});

module.exports = router;
