const config = {
    app_key: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    app_secret: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    access_token: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    fetch_menu_api:"https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/mapped_restaurant_menus",
    save_order_api: "https://47pfzh5sf2.execute-api.ap-southeast-1.amazonaws.com/V1/save_order",
    update_order_status_api:"https://qle1yy2ydc.execute-api.ap-southeast-1.amazonaws.com/V1/update_order_status",
    
    push_menu_api: "https://private-anon-e8405b2d6a-onlineorderingapisv210.apiary-mock.com/pushmenu_endpoint",
    // save_order_api: "https://private-anon-49987e512b-onlineorderingapisv210.apiary-mock.com/saveorder",
    order_status_api: "https://private-anon-588a10f15c-onlineorderingapisv210.apiary-mock.com/callback",
};
exports.config = config;