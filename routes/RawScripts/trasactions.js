const { supabase } = require("../../services/supabaseClient");

async function restructureTransactions() {

    try {
        
        const rpcResponse = await supabase.rpc("transaction_restructure")
        .eq("isdinein", true);
        // .eq("txnid", '09cb738e-d251-478d-aa60-383cf930c81a')
        if (rpcResponse?.data) {

            console.log("rpcResponse => ", rpcResponse.data.length);

            for (const transactionItem of rpcResponse?.data) {

                let count = 0;

                if (transactionItem?.itemtotalprice < transactionItem?.amount) {
                    
                    let outletData = {
                        packaging_charge: 0,
                        deliveryCharge: 0,
                        // convenienceFee: transactionItem?.convenienceamount ? ((transactionItem?.convenienceamount*100)/transactionItem?.itemtotalprice) : 0,
                        convenienceFee: 0,
                        commissionFee: transactionItem?.commissionamount ? ((transactionItem?.commissionamount*100)/transactionItem?.itemtotalprice) : (transactionItem?.commissionfee || 0),
                        isGSTShow: true,
                        bankLabel: transactionItem?.banklabel || ""
                    }
    
                    
                    let _diff = Number(transactionItem?.amount) - Number(transactionItem?.itemtotalprice);
                    _diff = _diff - (Number(transactionItem?.itemtotalprice) * 0.05);
    
                    console.log("_diff => ", _diff);
                    
                    // let conveniencePercentage = +Number((_diff / 1.18)).toFixed(2);
                    let conveniencePercentage = +Number(((_diff - (_diff * 0.18)) * 100) / Number(transactionItem?.itemtotalprice));
                    
                    if (!outletData?.convenienceFee) {
                        outletData.convenienceFee = conveniencePercentage;
                    }
                    
                    console.log("transactionItem", transactionItem);
                    console.log("outletData", outletData);
    
    
                    // if(outletData?.isPickUp) {
                    //     outletData.packaging_charge = transactionItem?.conveniencetotalamount ? (((transactionItem?.amount - transactionItem?.itemtotalprice) - transactionItem?.conveniencetotalamount - (transactionItem?.itemtotalprice*0.05)) > 1 ? ((amount - itemtotalprice) - conveniencetotalamount) : 0)
                    //                         : ((transactionItem?.amount - transactionItem?.itemtotalprice) - (transactionItem?.itemtotalprice*0.05));
                    // }
    
                    // if(outletData?.isDelivery) {
                    //     let packaging_delivery_charge = transactionItem?.conveniencetotalamount ? (((transactionItem?.amount - transactionItem?.itemtotalprice) - transactionItem?.conveniencetotalamount - (transactionItem?.itemtotalprice*0.05)) > 1 ? ((amount - itemtotalprice) - conveniencetotalamount) : 0)
                    //                         : ((transactionItem?.amount - transactionItem?.itemtotalprice) - (transactionItem?.itemtotalprice*0.05));
    
                    //     if (packaging_delivery_charge > outletData?.packaging_charge) {
                    //         outletData.deliveryCharge = packaging_delivery_charge - outletData?.packaging_charge;
                    //         outletData.packaging_charge = outletData?.packaging_charge;
                    //     } else {
                    //         outletData.deliveryCharge = packaging_delivery_charge / 2;
                    //         outletData.packaging_charge = packaging_delivery_charge / 2;
                    //     }
                    // }
    
                    // txnid
                    // amount
                    // isDelivery
                    // isDineIn
                    // isPickUp
                    // itemtotalprice
                    // convenienceAmount
                    // convenienceTotalAmount
                    // commissionAmount
                    // bankLabel
                    // packaging_charge
                    // commissionFee
    
    
                    let getPriceBreakdownResponse = await getPriceBreakdown("ss", transactionItem?.itemtotalprice, transactionItem?.isdinein, transactionItem?.ispickup, transactionItem?.isdelivery, outletData)
    
                    console.log("getPriceBreakdownResponse => ", getPriceBreakdownResponse);
    
                    console.log(`${transactionItem?.txnid}--------> `, getPriceBreakdownResponse.totalPriceForCustomer +" = "+ transactionItem.amount );

                    // const transactionResponse = await supabase.from("Transaction")
                    // .update({
                    //     amount: getPriceBreakdownResponse?.totalPriceForCustomer,
                    //     itemTotalPrice: transactionItem?.itemtotalprice,
                    //     mealpeVendorAmount: getPriceBreakdownResponse?.mealpeVendorAmount,
                    //     outletVendorAmount: getPriceBreakdownResponse?.outletVendorAmount,
                    //     foodGST: getPriceBreakdownResponse?.foodGST,
                    //     convenienceAmount: getPriceBreakdownResponse?.convenienceAmount,
                    //     convenienceGSTAmount: getPriceBreakdownResponse?.convenienceGSTAmount,
                    //     convenienceTotalAmount: getPriceBreakdownResponse?.convenienceTotalAmount,
                    //     commissionAmount: getPriceBreakdownResponse?.commissionAmount,
                    //     commissionGSTAmount: getPriceBreakdownResponse?.commissionGSTAmount,
                    //     commissionTotalAmount: getPriceBreakdownResponse?.commissionTotalAmount,
                    //     packagingCharge: getPriceBreakdownResponse?.packagingCharge,
                    //     deliveryCharge: getPriceBreakdownResponse?.deliveryCharge,
                    //     tdsAmount: getPriceBreakdownResponse?.TDS,
                    //     tcsAmount: getPriceBreakdownResponse?.TCS,
                    //     isGSTApplied: getPriceBreakdownResponse?.isGstApplied,
                    //     foodBasePrice: getPriceBreakdownResponse?.FoodBasePrice,
                    //     isUpdatedByScript: true
                    // }).eq("txnid", transactionItem?.txnid).select("*").maybeSingle();

                    // if (transactionResponse?.data) {
                    //     count++;
                    // } else {
                    //     console.error("transactionResponse => ", transactionResponse?.error);
                    // }

                    
                    console.log("\n\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
                }

                console.log("COUNT ----> ", count);
            }
        } else {
            throw rpcResponse?.error;
        }
    } catch (error) {
        console.error("ERROR => ", error);
    }
}

function getPriceBreakdown(outletId, itemTotalPrice, isDineIn = false, isPickUp = false, isDelivery = false, outletData) {
    itemTotalPrice = +itemTotalPrice;
    return new Promise(async (resolve, reject) => {
        if (outletId && itemTotalPrice) {
            try {
                // const outletResponse = await supabaseInstance.from("Outlet").select('*').eq("outletId", outletId).maybeSingle();
                // if (outletResponse?.data) {
                    // const outletData = outletResponse?.data;
                    let isGstApplied = false;
                    let foodGST = 0;
                    let commissionAmount;
                    let FoodBasePrice;
                    let convenienceAmount;
                    let commissionTotalAmount;
                    let TDS;
                    let TCS;
                    let convenienceGSTAmount;
                    let totalPriceForCustomer;
                    let mealpeVendorAmount;
                    let outletVendorAmount;
                    let convenienceTotalAmount;
                    let commissionGSTAmount;
                    let deliveryCharge = 0;
                    let packagingCharge = 0;

                    if (isPickUp === true) {
                        packagingCharge = outletData.packaging_charge;
                    }

                    if (isDelivery === true) {
                        packagingCharge = outletData.packaging_charge;
                        deliveryCharge = outletData.deliveryCharge;
                    }

                    if (outletData?.isGSTShow === true) {
                        isGstApplied = true;
                        foodGST = Number(((5 * itemTotalPrice) / 100).toFixed(2));
                        FoodBasePrice = itemTotalPrice;
                    } else {
                        isGstApplied = false;
                        FoodBasePrice = Number(((itemTotalPrice * 100) / 105).toFixed(2));
                        foodGST = Number((itemTotalPrice - FoodBasePrice).toFixed(2));
                    }
                    
                    convenienceAmount = (outletData.convenienceFee * FoodBasePrice) / 100;
                    convenienceGSTAmount = (18 * convenienceAmount) / 100;
                    convenienceTotalAmount = Number((convenienceAmount + convenienceGSTAmount)?.toFixed(2));
                    
                    commissionAmount = (outletData.commissionFee * (deliveryCharge + packagingCharge + FoodBasePrice)) / 100;
                    commissionGSTAmount = (18 *  commissionAmount) / 100;
                    commissionTotalAmount = Number((commissionAmount + commissionGSTAmount)?.toFixed(2));

                    TDS = (1 * FoodBasePrice) / 100;
                    TCS = (packagingCharge + deliveryCharge) / 101;

                    totalPriceForCustomer = Number((FoodBasePrice + packagingCharge + foodGST + deliveryCharge + convenienceTotalAmount)?.toFixed(2));
                    mealpeVendorAmount = Number((foodGST + convenienceTotalAmount + commissionTotalAmount + TDS + TCS)?.toFixed(2));
                    outletVendorAmount = Number((totalPriceForCustomer - mealpeVendorAmount)?.toFixed(2));

                    const outletBankLabel = outletData?.bankLabel || null;

                    resolve({
                        success: true,

                        itemTotalPrice,
                        foodGST,
                        commissionAmount,
                        FoodBasePrice,
                        convenienceAmount,
                        commissionTotalAmount,
                        TDS,
                        TCS,
                        convenienceGSTAmount,
                        totalPriceForCustomer,
                        mealpeVendorAmount,
                        outletVendorAmount,
                        packagingCharge,
                        deliveryCharge,
                        isGstApplied,
                        convenienceTotalAmount,
                        commissionGSTAmount,

                        outletBankLabel
                    })

                // } else {
                //     reject({ success: false, message: "Outlet id is wrong." });
                // }
            } catch (error) {
                console.log(error);
                reject({ success: false, error: error });
            }
        } else {
            reject({ success: false, message: "Please provide valid values." });
        }
    })
}

module.exports = {restructureTransactions}