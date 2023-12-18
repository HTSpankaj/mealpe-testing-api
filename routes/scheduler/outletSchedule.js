const nodeSchedule = require("node-schedule");
var supabaseInstance = require("../../services/supabaseClient").supabase;
const moment = require("moment-timezone");

// nodeSchedule.scheduleJob('0 */30 * * * *', async () => {
//     console.log("!!!!!!!!!!!!!!!!!!!! scheduleJob !!!!!!!!!!!!!!!!!!!!!! => ", moment().tz("Asia/Kolkata").format("MMMM Do YYYY, h:mm:ss a"));
//     try {
//         const outlet_close_to_open = await supabaseInstance.rpc('outlet_close_to_open', {});
//         const outlet_open_to_close = await supabaseInstance.rpc('outlet_open_to_close', {});
//         console.log("outlet_close_to_open => ", outlet_close_to_open);
//         console.log("outlet_open_to_close => ", outlet_open_to_close);

//         console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END ~~~~~~~~~~~~~~~~~~~~~~~~~~~");
//     } catch (error) {
//         console.error("error => ", error);

//         console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ END ~~~~~~~~~~~~~~~~~~~~~~~~~~~");
//     }
// })