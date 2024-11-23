befriend.me = {
    data: {
        me: null,
        sections: {
            all: null,
            options: null,
            active: null,
            collapsed: {},
        },
        categories: {},
        location: null,
    },
    autoComplete: {
        minChars: 2,
        selected: {
            filterList: { //by section

            },
        },
    },
    modes: {
        selected: 'solo', // default
        options: [
            {
                id: 'solo',
                name: `<div class="text">Solo</div>`,
                description: 'Just me',
                icon: `
                    <?xml version="1.0" encoding="UTF-8"?><svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 427.1641 512"><path d="M210.3516,246.6328c33.8828,0,63.2188-12.1523,87.1953-36.1289,23.9688-23.9727,36.125-53.3047,36.125-87.1914s-12.1523-63.2109-36.1289-87.1914C273.5664,12.1523,244.2305,0,210.3516,0s-63.2188,12.1523-87.1914,36.125-36.1289,53.3086-36.1289,87.1875,12.1562,63.2227,36.1289,87.1953c23.9805,23.9688,53.3164,36.125,87.1914,36.125ZM144.3789,57.3398c18.3945-18.3945,39.9727-27.3359,65.9727-27.3359s47.5781,8.9414,65.9766,27.3359c18.3945,18.3984,27.3398,39.9805,27.3398,65.9727s-8.9453,47.5781-27.3398,65.9766c-18.3984,18.3984-39.9805,27.3398-65.9766,27.3398s-47.5703-8.9453-65.9727-27.3398c-18.3984-18.3945-27.3438-39.9766-27.3438-65.9766s8.9453-47.5742,27.3438-65.9727Z"/><path d="M426.1289,393.7031c-.6914-9.9766-2.0898-20.8594-4.1484-32.3516-2.0781-11.5781-4.7539-22.5234-7.957-32.5273-3.3125-10.3398-7.8086-20.5508-13.375-30.3359-5.7695-10.1562-12.5508-19-20.1602-26.2773-7.957-7.6133-17.6992-13.7344-28.9648-18.1992-11.2266-4.4414-23.668-6.6914-36.9766-6.6914-5.2266,0-10.2812,2.1445-20.043,8.5-6.0078,3.918-13.0352,8.4492-20.8789,13.4609-6.707,4.2734-15.793,8.2773-27.0156,11.9023-10.9492,3.543-22.0664,5.3398-33.043,5.3398-10.9688,0-22.0859-1.7969-33.043-5.3398-11.2109-3.6211-20.3008-7.625-26.9961-11.8984-7.7695-4.9648-14.8008-9.4961-20.8984-13.4688-9.7539-6.3555-14.8086-8.5-20.0352-8.5-13.3125,0-25.75,2.2539-36.9727,6.6992-11.2578,4.457-21.0039,10.5781-28.9688,18.1992-7.6094,7.2812-14.3906,16.1211-20.1562,26.2734-5.5586,9.7852-10.0586,19.9922-13.3711,30.3398-3.1992,10.0039-5.875,20.9453-7.9531,32.5234-2.0625,11.4766-3.457,22.3633-4.1484,32.3633-.6797,9.7773-1.0234,19.9531-1.0234,30.2344,0,26.7266,8.4961,48.3633,25.25,64.3203,16.5469,15.7461,38.4375,23.7305,65.0664,23.7305h246.5312c26.6211,0,48.5117-7.9844,65.0625-23.7305,16.7578-15.9453,25.2539-37.5898,25.2539-64.3242-.0039-10.3164-.3516-20.4922-1.0352-30.2422ZM381.2227,466.5312c-10.9336,10.4062-25.4492,15.4648-44.3789,15.4648H90.3164c-18.9336,0-33.4492-5.0586-44.3789-15.4609-10.7227-10.207-15.9336-24.1406-15.9336-42.5859,0-9.5938.3164-19.0664.9492-28.1602.6172-8.9219,1.8789-18.7227,3.75-29.1367,1.8477-10.2852,4.1992-19.9375,6.9961-28.6758,2.6836-8.3789,6.3438-16.6758,10.8828-24.668,4.332-7.6172,9.3164-14.1523,14.8164-19.418,5.1445-4.9258,11.6289-8.957,19.2695-11.9805,7.0664-2.7969,15.0078-4.3281,23.6289-4.5586,1.0508.5586,2.9219,1.625,5.9531,3.6016,6.168,4.0195,13.2773,8.6055,21.1367,13.625,8.8594,5.6484,20.2734,10.75,33.9102,15.1523,13.9414,4.5078,28.1602,6.7969,42.2734,6.7969s28.3359-2.2891,42.2695-6.793c13.6484-4.4102,25.0586-9.5078,33.9297-15.1641,8.043-5.1406,14.9531-9.5938,21.1211-13.6172,3.0312-1.9727,4.9023-3.043,5.9531-3.6016,8.625.2305,16.5664,1.7617,23.6367,4.5586,7.6367,3.0234,14.1211,7.0586,19.2656,11.9805,5.5,5.2617,10.4844,11.7969,14.8164,19.4219,4.543,7.9883,8.207,16.2891,10.8867,24.6602,2.8008,8.75,5.1562,18.3984,7,28.6758,1.8672,10.4336,3.1328,20.2383,3.75,29.1445v.0078c.6367,9.0586.957,18.5273.9609,28.1484-.0039,18.4492-5.2148,32.3789-15.9375,42.582Z"/></svg>
                `,
            },
            {
                id: 'plus-one',
                name: `
                    <svg class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12ZM12,1C5.935,1,1,5.935,1,12s4.935,11,11,11,11-4.935,11-11S18.065,1,12,1Z"/><path d="M17.5,12.5H6.5c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h11c.276,0,.5.224.5.5s-.224.5-.5.5Z"/><path d="M12,18c-.276,0-.5-.224-.5-.5V6.5c0-.276.224-.5.5-.5s.5.224.5.5v11c0,.276-.224.5-.5.5Z"/></svg>
                    <div class="text">1</div>`,
                description: 'Me and a partner',
                icon: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 469.976 374.017">
                    <path class="outline" d="M197.396,258.637l-33.524-6.472c.032-.676.104-1.348.104-2.032v-20.844c19.9322-11.3726,34.5883-30.1323,40.8-52.224,16.9671-2.0638,29.0486-17.4913,26.9848-34.4583-1.0477-8.6131-5.6629-16.3909-12.7208-21.4377l1.012-15.344C223.6666,51.1135,182.2443,3.8308,127.5327.2163c-29.6844-1.9611-58.6839,9.4926-79.0167,31.2088-18.8774,19.9906-28.5213,46.9727-26.592,74.4l1.012,15.344c-13.9034,9.9415-17.1152,29.2717-7.1737,43.1752,5.0467,7.058,12.8245,11.6732,21.4377,12.7208,6.2117,22.0917,20.8678,40.8514,40.8,52.224v20.844c0,.684.072,1.356.104,2.032l-33.528,6.472C18.7156,263.6609.0331,286.2932,0,312.637v54.38c.0022,3.8557,3.1203,6.9846,6.976,7h228c3.8651-.0022,6.9978-3.1349,7-7v-54.376c-.0315-26.3466-18.7166-48.9815-44.58-54.004ZM207.572,161.985c.26-2.724.4-5.484.4-8.28v-22.836c8.5444,3.8486,12.3511,13.8952,8.5024,22.4396-1.7631,3.9142-4.9442,7.0146-8.9024,8.6764h0ZM35.884,104.901c-3.0886-46.9975,32.5066-87.6002,79.5041-90.6888,25.4863-1.6749,50.3816,8.1617,67.8399,26.8048,16.2122,17.1684,24.4953,40.3407,22.84,63.896l-.692,10.756c-.9707-.1387-1.9547-.2307-2.952-.276-19.696-6.748-36-26.552-36.16-26.752-2.1433-2.6336-5.8656-3.3532-8.836-1.708-53.116,29.528-115.656,28.4-116.268,28.4-1.5244-.0167-3.0474.0984-4.552.344l-.724-10.776ZM23.976,146.321c.0157-6.6657,3.9255-12.7073,10-15.452v22.836c0,2.8.144,5.556.4,8.28-6.2971-2.6598-10.3926-8.8282-10.4-15.664ZM47.976,153.705v-24.44c18-.504,66.368-4.116,111.272-27.428,9.7588,10.693,21.5691,19.3134,34.728,25.348v26.52c0,40.3168-32.6832,73-73,73s-73-32.6832-73-73ZM120.976,240.705c9.8805.0048,19.6889-1.6823,29-4.988v14.4c0,16.0163-12.9837,29-29,29s-29-12.9837-29-29v-14.4c9.3111,3.3058,19.1195,4.9928,29,4.988ZM227.976,360.017H13.976v-47.376c.024-19.6404,13.9521-36.5141,33.232-40.26l33.788-6.52c8.6524,22.0804,33.5663,32.9658,55.6466,24.3134,11.1371-4.3642,19.9491-13.1762,24.3134-24.3134l33.788,6.52c19.2799,3.7459,33.208,20.6196,33.232,40.26v47.376Z M429.704,269.905l-13.396-2.588,15.452-1.368c16.2248-1.468,28.5575-15.2238,28.252-31.512l-2-99.964c-1.1376-53.2281-45.2097-95.4558-98.4378-94.3182-51.6266,1.1034-93.2148,42.6916-94.3182,94.3182l-2,99.968c-.2635,16.2755,12.0554,30.0066,28.264,31.504l15.456,1.372-13.412,2.588c-23.3664,4.5435-40.2448,24.996-40.272,48.8v48.312c.0022,3.8651,3.1349,6.9978,7,7h202.684c3.8651-.0022,6.9978-3.1349,7-7v-48.32c-.0311-23.801-16.9085-44.2491-40.272-48.792ZM361.64,241.5051c-35.3807-.0418-64.0551-28.7073-64.108-64.088v-23.068c11.4219-5.3275,21.695-12.8315,30.244-22.092,39.284,20.24,81.42,23.652,97.964,24.18v20.98c-.0463,35.3823-28.7177,64.0537-64.1,64.1v-.012ZM336.656,251.345c16.2012,5.5708,33.7988,5.5708,50,0v11.792c0,13.8071-11.1929,25-25,25s-25-11.1929-25-25v-11.792ZM277.252,234.7171l2-99.956c.9511-45.4983,38.6058-81.611,84.1041-80.6599,44.1592.9231,79.7368,36.5007,80.6599,80.6599l2,99.976c.1641,8.9305-6.6001,16.4699-15.496,17.272l-29.864,2.644v-9.6801c24.1594-13.9227,39.061-39.672,39.096-67.556v-27.908c.0003-1.8871-.7612-3.6943-2.112-5.012-1.3415-1.3316-3.1706-2.0545-5.06-2-.568.036-55.792,1.08-102.944-25.136-2.9692-1.6478-6.6925-.9297-8.836,1.704-.148.18-14.856,18.068-32.432,23.772-2.8839.9388-4.836,3.6271-4.836,6.66v27.92c.035,27.8955,14.9489,53.6535,39.124,67.572v9.66l-29.896-2.644c-8.8928-.8246-15.6507-8.3582-15.508-17.288ZM455.976,360.017h-188.68v-41.32c.0235-17.0948,12.1441-31.7817,28.924-35.048l29.388-5.664c8.1882,19.9077,30.9645,29.4081,50.8721,21.2199,9.6219-3.9576,17.2623-11.5979,21.2199-21.2199l29.348,5.664c16.7815,3.2646,28.9041,17.9519,28.928,35.048v41.32Z"/>
                    <path class="filled" d="M197.396,258.637l-33.524-6.472c.032-.676.104-1.348.104-2.032v-20.844c19.9322-11.3726,34.5883-30.1323,40.8-52.224,16.9671-2.0638,29.0486-17.4913,26.9848-34.4583-1.0477-8.6131-5.6629-16.3909-12.7208-21.4377l1.012-15.344C223.6666,51.1135,182.2443,3.8308,127.5327.2163c-29.6844-1.9611-58.6839,9.4926-79.0167,31.2088-18.8774,19.9906-28.5213,46.9727-26.592,74.4l1.012,15.344c-13.9034,9.9415-17.1152,29.2717-7.1737,43.1752,5.0467,7.058,12.8245,11.6732,21.4377,12.7208,6.2117,22.0917,20.8678,40.8514,40.8,52.224v20.844c0,.684.072,1.356.104,2.032l-33.528,6.472C18.7156,263.6609.0331,286.2932,0,312.637v54.38c.0022,3.8557,3.1203,6.9846,6.976,7h228c3.8651-.0022,6.9978-3.1349,7-7v-54.376c-.0315-26.3466-18.7166-48.9815-44.58-54.004 M429.704,269.905l-13.396-2.588,15.452-1.368c16.2248-1.468,28.5575-15.2238,28.252-31.512l-2-99.964c-1.1376-53.2281-45.2097-95.4558-98.4378-94.3182-51.6266,1.1034-93.2148,42.6916-94.3182,94.3182l-2,99.968c-.2635,16.2755,12.0554,30.0066,28.264,31.504l15.456,1.372-13.412,2.588c-23.3664,4.5435-40.2448,24.996-40.272,48.8v48.312c.0022,3.8651,3.1349,6.9978,7,7h202.684c3.8651-.0022,6.9978-3.1349,7-7v-48.32c-.0311-23.801-16.9085-44.2491-40.272-48.792Z"/>
                </svg>
                `
            },
            {
                id: 'plus-kids',
                name: `
                    <svg class="plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12,24C5.383,24,0,18.617,0,12S5.383,0,12,0s12,5.383,12,12-5.383,12-12,12ZM12,1C5.935,1,1,5.935,1,12s4.935,11,11,11,11-4.935,11-11S18.065,1,12,1Z"/><path d="M17.5,12.5H6.5c-.276,0-.5-.224-.5-.5s.224-.5.5-.5h11c.276,0,.5.224.5.5s-.224.5-.5.5Z"/><path d="M12,18c-.276,0-.5-.224-.5-.5V6.5c0-.276.224-.5.5-.5s.5.224.5.5v11c0,.276-.224.5-.5.5Z"/></svg>
                    <div class="text">Kids</div>`,
                description: 'Family mode',
                icon: `
                        <svg id="Layer_3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 709.8027 495.6616"><path d="M0,264.6786c-.0015,2.5669.4149,5.117,1.2328,7.5501l8.5164,25.5626c3.2306,9.7579,12.3584,16.341,22.6371,16.3265h11.122c.833,1.7593,1.706,3.5119,2.6655,5.2245,14.1212,25.8819,38.478,44.6302,67.1117,51.6582v9.7559c-47.8217.0551-86.5751,38.8085-86.6301,86.6301v19.9916c0,3.6803,2.9835,6.6639,6.6639,6.6639h213.2434c3.6803,0,6.6639-2.9835,6.6639-6.6639v-19.9916c-.0551-47.8217-38.8085-86.5751-86.6301-86.6301v-9.7559c28.6436-7.0213,53.0112-25.7704,67.1384-51.6582.9329-1.7193,1.8059-3.4652,2.6656-5.2245h11.0953c10.285.0263,19.4237-6.5563,22.6571-16.3198l8.5231-25.5692c3.6228-10.7783-.9328-22.6096-10.8487-28.1748l8.5631-29.9474c2.3243-8.1898,3.4995-16.6628,3.4918-25.176-.0069-34.2745-17.661-66.1304-46.7203-84.3045-24.8281-15.525-53.5227-23.7528-82.8051-23.7433h-4.8779c-24.7957.0718-47.9844,12.2823-62.0738,32.6862l-10.2623-1.7059C38.9195,106.1621,6.5547,129.2839.8539,163.507.2863,166.9143.0007,170.3626,0,173.8169c-.0043,23.0213,3.7063,45.8924,10.9887,67.7315l.8796,2.6256C4.5462,248.4107.0267,256.219,0,264.6786ZM32.3863,300.79c-4.5382.0036-8.5674-2.9028-9.9958-7.2103l-8.5231-25.5692c-1.8402-5.52,1.1429-11.4866,6.6629-13.3267,1.0747-.3583,2.2001-.5408,3.3329-.5407h9.456v14.8937c.0115,10.7747,1.6769,21.4839,4.9379,31.7533h-5.8709ZM239.8989,467.3865v13.3277H39.9831v-13.3277c.051-30.2616,18.6765-57.3873,46.9002-68.3045,2.8664,29.3029,28.9447,50.734,58.2476,47.8676,25.339-2.4786,45.389-22.5286,47.8676-47.8676,28.2238,10.9172,46.8492,38.0429,46.9002,68.3045ZM179.8575,395.3501c-.6978,22.0453-19.1348,39.3508-41.18,38.653-21.0651-.6668-37.9862-17.5879-38.653-38.653,4.3726-.8248,8.8114-1.2486,13.2611-1.2661,0,14.7214,11.934,26.6554,26.6554,26.6554s26.6554-11.934,26.6554-26.6554c4.4497.0175,8.8885.4413,13.2611,1.2661ZM153.2687,394.084c0,7.3607-5.967,13.3277-13.3277,13.3277s-13.3277-5.967-13.3277-13.3277v-20.7046c3.9043.4559,7.8309.6939,11.7617.713h3.132c3.9308-.0191,7.8574-.2571,11.7617-.713v20.7046ZM141.507,360.7647h-3.132c-50.66,0-91.728-41.068-91.728-91.728v-19.4252l25.6492-35.8982,8.3698,16.7529c1.6431,3.2932,5.6447,4.6309,8.9379,2.9879.0017-.0008.0033-.0017.005-.0025,18.784-9.3968,33.2784-25.6023,40.5296-45.3142l2.4256-8.1499,3.6451,15.3735c7.6754,26.9021,32.259,45.4533,60.2346,45.4542h36.7912v28.2214c-.0037,50.6584-41.0695,91.7243-91.728,91.728ZM266.0145,268.0105l-8.5297,25.5759c-1.4265,4.3051-5.4538,7.2095-9.9891,7.2036h-5.8709c3.261-10.2694,4.9264-20.9785,4.9379-31.7533v-14.8937h9.456c5.8186-.0005,10.536,4.716,10.5365,10.5346.0001,1.1328-.1825,2.2582-.5407,3.3329ZM31.1402,135.8062c11.0553-9.2421,25.6-13.1862,39.8099-10.7954l14.5872,2.4256c2.6986.4603,5.4024-.787,6.8038-3.1387,11.2442-18.6191,31.3867-30.0241,53.1376-30.0873h4.8779c26.7855-.0093,53.0329,7.5191,75.7414,21.7242,25.1672,15.731,40.4559,43.3168,40.4563,72.9959.0009,7.2755-1.0129,14.5155-3.0121,21.5109l-8.683,30.3739h-8.2965v-6.6639c0-3.6803-2.9835-6.6639-6.6639-6.6639h-43.455c-21.8994-.0084-41.1697-14.4584-47.3134-35.4784l-9.3294-39.3634c-.8466-3.5817-4.4364-5.7989-8.018-4.9523-2.325.5496-4.178,2.3017-4.8565,4.5924l-9.376,31.6267c-5.314,14.2235-15.1701,26.2977-28.0415,34.3522l-10.2091-20.4114c-1.6464-3.2915-5.6495-4.6252-8.941-2.9787-.9715.4859-1.8094,1.202-2.4409,2.0857l-31.3601,43.8549h-11.7617l-1.1595-3.4785c-6.8307-20.4809-10.3117-41.9299-10.309-63.5199-.0209-14.691,6.5094-28.6263,17.8125-38.0106Z"/><path d="M650.7236,342.7556l-44.4273-8.5769c.0424-.8959.1378-1.7864.1378-2.6929v-27.6233c26.4149-15.0713,45.8377-39.9325,54.0697-69.2092,22.4854-2.735,38.4963-23.1801,35.7613-45.6655-1.3884-11.4145-7.5047-21.7219-16.8581-28.41l1.3411-20.3344c4.7902-72.5058-50.1042-135.1666-122.6101-139.9568-39.339-2.599-77.7702,12.58-104.7159,41.3591-25.0171,26.4923-37.7975,62.2499-35.2407,98.5977l1.3411,20.3344c-18.4254,13.1749-22.6817,38.792-9.5068,57.2174,6.6881,9.3535,16.9955,15.4698,28.41,16.8581,8.232,29.2767,27.6548,54.1379,54.0697,69.2092v27.6233c0,.9065.0954,1.797.1378,2.6929l-44.4326,8.5769c-34.2712,6.6578-59.03,36.651-59.0738,71.5628v72.0664c.0029,5.1098,4.1351,9.2562,9.2449,9.2767h302.1542c5.1222-.0029,9.2738-4.1545,9.2767-9.2767v-72.0611c-.0418-34.9155-24.8039-64.9121-59.0791-71.5681ZM664.2092,214.6687c.3446-3.6099.5301-7.2676.5301-10.973v-30.2631c11.3234,5.1004,16.3681,18.4144,11.2677,29.7378-2.3365,5.1872-6.5523,9.296-11.7978,11.4983h0ZM436.6818,139.0188c-4.0931-62.2828,43.079-116.0911,105.3619-120.1842,33.7754-2.2196,66.7676,10.8162,89.904,35.5227,21.485,22.7523,32.462,53.4611,30.2684,84.6774l-.9171,14.2543c-1.2864-.1838-2.5904-.3057-3.9121-.3658-26.1019-8.9427-47.7086-35.1877-47.9206-35.4528-2.8404-3.4902-7.7733-4.4437-11.7098-2.2635-70.3913,39.1316-153.2717,37.6367-154.0828,37.6367-2.0202-.0221-4.0385.1304-6.0325.4559l-.9595-14.2807ZM420.9008,193.9102c.0208-8.8337,5.2023-16.8402,13.2524-20.4776v30.2631c0,3.7106.1908,7.363.5301,10.973-8.3452-3.5249-13.7727-11.6995-13.7825-20.7585ZM452.7066,203.6957v-32.3888c23.8543-.6679,87.9534-5.4547,147.4619-36.3486,12.9327,14.1707,28.5842,25.5948,46.0229,33.5921v35.1453c0,53.4293-43.313,96.7424-96.7424,96.7424s-96.7424-43.3131-96.7424-96.7424ZM549.4489,318.9914c13.094.0063,26.0925-2.2294,38.4319-6.6103v19.0834c0,21.2254-17.2066,38.4319-38.4319,38.4319s-38.4319-17.2065-38.4319-38.4319v-19.0834c12.3394,4.3809,25.3379,6.6166,38.4319,6.6103ZM691.2494,477.1082h-283.6009v-62.7845c.0318-26.0282,18.4899-48.3898,44.0403-53.3541l44.7771-8.6405c11.4665,29.2617,44.4833,43.6875,73.745,32.221,14.7594-5.7836,26.4373-17.4616,32.221-32.221l44.7771,8.6405c25.5504,4.9643,44.0085,27.3259,44.0403,53.3541v62.7845Z"/></svg>
                        `
            }
        ]
    },
    actions: {
        delete: {
            section: null,
        },
    },
    init: function () {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.me.setModes();

                await befriend.me.getMe();
                befriend.me.setMe();
                befriend.me.setActive();
                befriend.me.setOptions();
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    setModes: function () {
        const modesHtml = `
            <div class="${befriend.variables.class_modes_section}">
                <div class="tab">
                    <div class="title">Mode</div>
                </div>
                <div class="mode-options">
                    ${befriend.me.modes.options.map(option => `
                        <div class="mode-option ${option.id === befriend.me.modes.selected ? 'selected' : ''}" data-mode="${option.id}">
                            <div class="content">
                                <div class="icon">${option.icon}</div>
                                <div class="name">${option.name}</div>
                                <div class="description">${option.description}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Insert at the beginning of sections
        const sectionsEl = befriend.els.me.querySelector('.me-container');
        sectionsEl.insertAdjacentHTML('afterbegin', modesHtml);

        // Initialize event handlers
        befriend.me.events.onModeSelect();
    },
    getMe: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.get('/me', {
                    location: befriend.location.device,
                });

                let data = r.data;

                befriend.me.data.me = data.me;
                befriend.me.data.sections.all = data.sections.all;
                befriend.me.data.sections.options = data.sections.options;
                befriend.me.data.sections.active = sortObj(data.sections.active, 'position');

                if (data.country) {
                    befriend.me.data.country = data.country;
                }

                //local data
                befriend.user.setLocal('me.me', data.me);
            } catch (e) {
                console.error(e);

                if (
                    befriend.user.local.data &&
                    befriend.user.local.data.me &&
                    befriend.user.local.data.me.me
                ) {
                    console.log('Using local me data');
                    befriend.me.data.me = befriend.user.local.data.me.me;
                }
            }

            resolve();
        });
    },
    getCategoryOptions: function (endpoint, category_token) {
        return new Promise(async (resolve, reject) => {
            try {
                 let r = await befriend.auth.get(endpoint, {
                     category_token
                 });

                 resolve(r.data);
            } catch(e) {
                console.error(e);
                return reject();
            }
        });
    },
    setMe: function () {
        if (!befriend.me.data.me) {
            return;
        }

        let me_obj = befriend.me.data.me;

        //first name
        let first_name_el = befriend.els.me.querySelector('.first-name');

        //birthday
        let birthday_el = befriend.els.me.querySelector('.birthday');

        //set
        if (me_obj.first_name) {
            first_name_el.innerHTML = me_obj.first_name;
        }

        if (me_obj.birth_date) {
            let years = dayjs().diff(dayjs(me_obj.birth_date), 'years');

            let date = dayjs(me_obj.birth_date).format('MMM. Do, YYYY');

            birthday_el.querySelector('.age').innerHTML = years;

            if (years >= 100) {
                addClassEl('one-hundred', birthday_el.querySelector('.age'));
            }

            // birthday_el.querySelector('.date').innerHTML = date;
        }
    },
    saveSection: function (key) {
        return new Promise(async (resolve, reject) => {
            try {
                befriend.toggleSpinner(true);
                let location = befriend.location.device;
                let r = await befriend.auth.post('/me/sections', { key, location });

                befriend.me.data.sections.active[key] = r.data;
            } catch (e) {
                console.error(e);
            }

            befriend.toggleSpinner(false);

            resolve();
        });
    },
    getSectionElByKey: function (key) {
        let sections_el = befriend.els.me.querySelector('.me-container').querySelector('.sections');

        return sections_el.querySelector(`.section[data-key="${key}"]`);
    },
    getSectionTableKey: function (section_key) {
        let section_el = this.getSectionElByKey(section_key);

        return section_el.getAttribute('data-table-key');
    },
    getSectionTableData: function (section_key) {
        let section_data = this.getActiveSection(section_key);

        return section_data?.data?.tables;
    },
    getActiveSection: function (key) {
        return befriend.me.data.sections.active?.[key];
    },
    getSectionAutoComplete: function (key) {
        let section = this.getActiveSection(key);

        if(section) {
            return section.data?.autoComplete;
        }

        return null;
    },
    buildSelectFilterList: function (key, data) {
        let items = data?.filter?.list;

        if (!items || !items.length) {
            return '';
        }

        let list_html = ``;

        for (let item of items) {
            let emoji = '';

            if (item.emoji) {
                emoji = `<div class="emoji">${item.emoji}</div>`;
            }

            list_html += `<div class="item" data-id="${item.id}">
                            ${emoji}
                            <div class="name">${item.name}</div>
                        </div>`;
        }

        //selected
        let selected_str = '';

        let filterListObj =  befriend.me.autoComplete.selected.filterList;

        if (key === 'schools') {
            if (befriend.me.data.country) {
                selected_str = befriend.me.data.country.name;

               filterListObj[key] = {
                    item: befriend.me.data.country,
                };
            } else if (
                befriend.user.local.data.me &&
                befriend.user.local.data.me.filterList &&
                befriend.user.local.data.me.filterList[key]
            ) {
                filterListObj[key] = {
                    item: befriend.user.local.data.me.filterList[key],
                };

                selected_str = befriend.user.local.data.me.filterList[key].name;
            }
        }

        return `<div class="select-container">
                        <div class="selected-container">
                          <span class="selected-name">${selected_str}</span>
                          <div class="select-arrow"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448.569 256.5604"><g id="Layer_1-2"><path d="M441.9533,40.728l-193.176,205.2496c-13.28,14.1104-35.704,14.1104-48.984,0L6.6157,40.728C-7.8979,25.3056,3.0349,0,24.2125,0h400.1424c21.1792,0,32.112,25.3056,17.5984,40.728h0Z"/></g></svg></div>
                        </div>
                        
                        <div class="select-dropdown">
                          <div class="select-search-container">
                            <input class="select-input" type="text" placeholder="${data.placeholders.list}">
                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 611.9975 612.0095"><g id="_x34_"><path d="M606.203,578.714l-158.011-155.486c41.378-44.956,66.802-104.411,66.802-169.835-.02-139.954-115.296-253.393-257.507-253.393S0,113.439,0,253.393s115.276,253.393,257.487,253.393c61.445,0,117.801-21.253,162.068-56.586l158.624,156.099c7.729,7.614,20.277,7.614,28.006,0,7.747-7.613,7.747-19.971.018-27.585ZM257.487,467.8c-120.326,0-217.869-95.993-217.869-214.407S137.161,38.986,257.487,38.986s217.869,95.993,217.869,214.407-97.542,214.407-217.869,214.407Z"/></g></svg>
                          </div>
                          <div class="select-list">${list_html}</div>
                          <div class="no-results">${data.filter.noResults}</div>
                        </div>
                      </div>`;
    },
    selectAutoCompleteFilterItem: function (section_key, item_id) {
        let section_data = befriend.me.getSectionAutoComplete(section_key);

        if (!section_data) {
            return;
        }

        item_id = parseInt(item_id);

        let selected_item = section_data.filter.list.find((item) => item.id === item_id);

        if (!selected_item) {
            throw new Error('Select item not found');
        }

        //data
        befriend.me.autoComplete.selected.filterList[section_key] = {
            item: selected_item,
            needsReset: true,
        };

        //save for local storage
        befriend.user.setLocal(`me.filterList.${section_key}`, selected_item);

        //ui
        let section_el = befriend.me.getSectionElByKey(section_key);
        let select_container = section_el.querySelector('.select-container');
        let selected_name_el = select_container.querySelector('.selected-name');
        selected_name_el.innerHTML = selected_item.name;

        removeClassEl('open', select_container);
    },
    getRowColsClass: function (section_data, category) {
        if (section_data?.data?.styles?.rowCols) {
            if (typeof section_data.data.styles.rowCols === 'object') {
                return category === 'mine' ?
                    section_data.data.styles.rowCols.my || section_data.data.styles.rowCols.default :
                    section_data.data.styles.rowCols.default;
            }
            return section_data.data.styles.rowCols;
        }
        return '';
    },
    addSection: async function (key, on_update, skip_save) {
        let option_data = befriend.me.data.sections.all[key];
        let sections_el = befriend.els.me.querySelector('.me-container').querySelector('.sections');
        let section_els = sections_el.getElementsByClassName('section');

        let section_el = befriend.me.getSectionElByKey(key);

        let section_collapsed = '';
        let section_height = '';

        if (option_data) {
            let prev_index;

            //delete section if prev, re-insert at same position
            if(section_el) {
                for(let i = 0; i < section_els.length; i++) {
                    if(section_els[i] === section_el) {
                        prev_index = i;
                        break;
                    }
                }

                section_el.parentNode.removeChild(section_el);
            }

            delete befriend.me.data.sections.options[key];

            if (!(key in befriend.me.data.sections.active)) {
                if (!skip_save) {
                    //save to server
                    try {
                        await befriend.me.saveSection(key);
                    } catch (e) {
                        console.error(e);
                    }
                }
            }

            let section_data = befriend.me.getActiveSection(key);

            if(!section_data?.data?.tables) {
                return;
            }

            let section_type = section_data.data?.type?.name;
            let table_data = section_data.data.tables ? section_data.data.tables[0] : null;

            let autocomplete_html = '';
            let categories_html = '';
            let tabs_html = '';
            let items_html = '';

            if (section_data.data) {
                //autocomplete
                if (section_data.data.autoComplete) {
                    let select_list = befriend.me.buildSelectFilterList(
                        key,
                        section_data.data.autoComplete,
                    );

                    autocomplete_html = `
                            <div class="search-container ${select_list ? 'has-select' : ''}">
                                <div class="autocomplete-container">
                                    <div class="input-container">
                                        <input type="text" class="search-input" placeholder="${section_data.data.autoComplete.placeholders.main}">
                                        <div class="search-icon-container">
                                            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 611.9975 612.0095"><g id="_x34_"><path d="M606.203,578.714l-158.011-155.486c41.378-44.956,66.802-104.411,66.802-169.835-.02-139.954-115.296-253.393-257.507-253.393S0,113.439,0,253.393s115.276,253.393,257.487,253.393c61.445,0,117.801-21.253,162.068-56.586l158.624,156.099c7.729,7.614,20.277,7.614,28.006,0,7.747-7.613,7.747-19.971.018-27.585ZM257.487,467.8c-120.326,0-217.869-95.993-217.869-214.407S137.161,38.986,257.487,38.986s217.869,95.993,217.869,214.407-97.542,214.407-217.869,214.407Z"/></g></svg>
                                        </div>
                                    </div>

                                    <div class="autocomplete-list"></div>
                                </div>
                                
                                ${select_list}
                            </div>
                        `;
                }

                //categories
                if (section_data.data?.categories?.options) {
                    categories_html = `<div class="category-btn mine active" data-category="mine">
                                                ${section_data.data.myStr}
                                        </div>`;

                    for (let category of section_data.data.categories.options) {
                        let heading_html = category.heading ? `<div class="heading">${category.heading}</div>` : '';

                        let data_category = `data-category="${category.name}"`;

                        let data_category_token = '';

                        if(category.token) {
                            data_category_token = `data-category-token="${category.token}"`;
                        }

                        let data_table_key = '';

                        if(category.table_key) {
                            data_table_key = `data-category-table="${category.table_key}"`;
                        }

                        categories_html += `<div class="category-btn ${heading_html ? 'w-heading' : ''}" ${data_category} ${data_table_key} ${data_category_token}>
                                            ${heading_html}
                                            <div class="name">${category.name}</div>
                                        </div>`;
                    }

                    categories_html = `<div class="categories-container">
                                        <div class="category-filters">${categories_html}</div>
                                    </div>`;
                }

                //tabs
                if(section_data.data?.tabs?.length) {
                    for(let i = 0; i < section_data.data.tabs.length; i++) {
                        let tab = section_data.data.tabs[i];

                        tabs_html += `<div class="tab ${i === 0 ? 'active': ''}" data-key="${tab.key}">${tab.name}</div>`
                    }

                    tabs_html = `<div class="tabs">${tabs_html}</div>`;
                }

                //options/items
                if(['buttons'].includes(section_type)) {
                    if(section_data.data?.options?.length) {
                        let options = [...section_data.data.options];

                        options.sort((a, b) => {
                            const aSelected = Object.values(section_data.items).some(item => item.token === a.token);
                            const bSelected = Object.values(section_data.items).some(item => item.token === b.token);
                            if (aSelected && !bSelected) return -1;
                            if (!aSelected && bSelected) return 1;
                            return 0;
                        });

                        for(let option of options) {
                            let item_html = befriend.me.sectionItemHtml(key, table_data?.name, option);

                            items_html += item_html;
                        }
                    }
                } else if (Object.keys(section_data.items).length) {
                    for (let token in section_data.items) {
                        //filter by tab
                        let item = section_data.items[token];

                        if(tabs_html) {
                            let active_tab = section_data.data.tabs[0];

                            if(active_tab && item.table_key !== active_tab.key) {
                                continue;
                            }
                        }

                        let item_html = befriend.me.sectionItemHtml(key, table_data?.name, item);

                        items_html += item_html;
                    }
                }
            }

            //initialize collapsed if saved
            if (befriend.me.data.sections.collapsed[key]) {
                section_collapsed = 'collapsed';
                section_height = '0';
            }

            // Build section classes
            let has_type = section_type || '';
            let has_tabs = tabs_html ? 'w-tabs' : '';
            let has_categories = categories_html ? 'w-categories' : '';
            let row_cols_class = befriend.me.getRowColsClass(section_data, 'mine');

            let html = `<div class="section my-items ${key} ${section_collapsed} ${has_type} ${has_categories} ${has_tabs} ${items_html ? '' : 'no-items'}" data-key="${key}" data-table-key="${table_data?.name ? table_data.name : ''}" style="${section_height}">
                                <div class="section-top">
                                    <div class="icon">${option_data.icon}</div>
                                    <div class="title">${option_data.section_name}</div>
                                    <div class="actions">
                                        <div class="menu">
                                            <div class="action" data-action="delete">
                                                <div class="icon"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 346.8033 427.0013"><path d="M232.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M114.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/><path d="M28.4016,127.1224v246.3789c0,14.5625,5.3398,28.2383,14.668,38.0508,9.2852,9.8398,22.207,15.4258,35.7305,15.4492h189.2031c13.5273-.0234,26.4492-5.6094,35.7305-15.4492,9.3281-9.8125,14.668-23.4883,14.668-38.0508V127.1224c18.543-4.9219,30.5586-22.8359,28.0781-41.8633-2.4844-19.0234-18.6914-33.2539-37.8789-33.2578h-51.1992v-12.5c.0586-10.5117-4.0977-20.6055-11.5391-28.0312C238.4212,4.0482,228.3118-.0846,217.8001.0013h-88.7969c-10.5117-.0859-20.6211,4.0469-28.0625,11.4688-7.4414,7.4258-11.5977,17.5195-11.5391,28.0312v12.5h-51.1992c-19.1875.0039-35.3945,14.2344-37.8789,33.2578-2.4805,19.0273,9.5352,36.9414,28.0781,41.8633ZM268.0032,407.0013H78.8001c-17.0977,0-30.3984-14.6875-30.3984-33.5v-245.5h250v245.5c0,18.8125-13.3008,33.5-30.3984,33.5ZM109.4016,39.5013c-.0664-5.207,1.9805-10.2188,5.6758-13.8945,3.6914-3.6758,8.7148-5.6953,13.9258-5.6055h88.7969c5.2109-.0898,10.2344,1.9297,13.9258,5.6055,3.6953,3.6719,5.7422,8.6875,5.6758,13.8945v12.5H109.4016v-12.5ZM38.2024,72.0013h270.3984c9.9414,0,18,8.0586,18,18s-8.0586,18-18,18H38.2024c-9.9414,0-18-8.0586-18-18s8.0586-18,18-18Z"/><path d="M173.4016,154.7044c-5.5234,0-10,4.4766-10,10v189c0,5.5195,4.4766,10,10,10s10-4.4805,10-10v-189c0-5.5234-4.4766-10-10-10Z"/></svg></div>
                                                <div class="name">Delete</div>
                                            </div>
                                        </div>                                                   
                                        <svg class="more" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 426.667 85.334"><circle cx="42.667" cy="42.667" r="42.667"/><circle cx="213.333" cy="42.667" r="42.667"/><circle cx="384" cy="42.667" r="42.667"/></svg>
                                    </div>
                                </div>
                                
                                <div class="section-container">
                                    ${autocomplete_html}
                                    ${categories_html}
                                    ${tabs_html}
                                    <div class="items-container">
                                        <div class="items ${row_cols_class}">
                                            ${items_html }
                                        </div>
                                        <div class="no-items">No Items</div>
                                    </div>
                                </div>
                            </div>`;

            // Insert section at correct position
            if(isNumeric(prev_index) && section_els.length) {
                if(prev_index === 0) {
                    sections_el.insertAdjacentHTML('afterbegin', html);
                } else {
                    let insert_after_el = section_els[prev_index - 1];

                    insert_after_el.insertAdjacentHTML('afterend', html);
                }
            } else {
                sections_el.insertAdjacentHTML('beforeend', html);
            }

            befriend.me.events.onSectionCategory();
            befriend.me.events.onSectionTabs();
            befriend.me.events.onSectionActions();
            befriend.me.events.onSectionReorder();
            befriend.me.events.autoComplete();
            befriend.me.events.autoCompleteFilterList();
            befriend.me.events.onActionSelect();
            befriend.me.events.onUpdateSectionHeight();
            befriend.me.events.onSelectItem();
            befriend.me.events.onSelectOptionItem();
            befriend.me.events.onRemoveItem();
            befriend.me.events.onFavorite();
            befriend.me.events.onOpenSecondary();
            befriend.me.events.onSelectSecondary();

            // Initialize section height
            section_el = befriend.me.getSectionElByKey(key);

            if (!section_collapsed) {
                befriend.me.updateSectionHeight(section_el, false, true, true);
            }
        }
    },
    addSectionItem: function (section_key, item_token) {
        return new Promise(async (resolve, reject) => {
            try {
                let section_data = befriend.me.getActiveSection(section_key);
                let section_el = befriend.me.getSectionElByKey(section_key);

                if (!('items' in section_data)) {
                    section_data.items = {};
                }

                let filterKey = section_data.data?.autoComplete?.filter?.hashKey;
                let hash_token = null;

                if(filterKey) {
                    hash_token = befriend.me.autoComplete.selected.filterList[section_key].item[filterKey];
                }

                let r = await befriend.auth.post(`/me/sections/item`, {
                    section_key: section_key,
                    table_key: befriend.me.getSectionTableKey(section_key),
                    item_token: item_token,
                    hash_token: hash_token || null,
                });

                section_data.items[item_token] = r.data;

                //add unique selection to options if not exists
                if(section_data.data.options) {
                    let option = section_data.data.options.find((item) => item.token === item_token);

                    if (!option) {
                        section_data.data.options.push(r.data);
                    }
                }

                //select first category
                let category_btn_first = section_el.querySelector('.category-btn');

                if (category_btn_first) {
                    fireClick(category_btn_first);
                }

                //select corresponding tab if
                let tab_els = section_el.querySelectorAll('.section-container .tab');

                if(tab_els && r.data.table_key) {
                    for(let i = 0; i < tab_els.length; i++) {
                        let tab_el = tab_els[i];

                        if(tab_el.getAttribute('data-key') === r.data.table_key) {
                            fireClick(tab_el);
                            break;
                        }
                    }
                }

                //re-add section if no categories
                if(!category_btn_first) {
                    befriend.me.addSection(section_key, true);
                }
            } catch (e) {
                console.error(e);
            }

            resolve();
        });
    },
    deleteSection: function (section_key) {
        return new Promise(async (resolve, reject) => {
            try {
                let r = await befriend.auth.delete(`/me/sections/${section_key}`);

                befriend.me.toggleConfirm(false);

                //copy data all->options
                befriend.me.data.sections.options[section_key] =
                    befriend.me.data.sections.all[section_key];

                //delete from active
                delete befriend.me.data.sections.active[section_key];

                //delete in collapsed
                delete befriend.me.data.sections.collapsed[section_key];

                befriend.user.setLocal(
                    'me.sections.collapsed',
                    befriend.me.data.sections.collapsed,
                );

                //remove el
                let section_el = befriend.me.getSectionElByKey(section_key);

                if (section_el) {
                    section_el.parentNode.removeChild(section_el);
                }

                //reset options and event handlers
                befriend.me.setOptions();

                befriend.me.events.onSelectAvailableSection();

                resolve();
            } catch (e) {
                console.error(e);
                reject();
            }
        });
    },
    setActive: function () {
        if (befriend.me.data.sections.active) {
            for (let key in befriend.me.data.sections.active) {
                befriend.me.addSection(key, false, true);
            }

            //enable first category for each section
            let sections = befriend.els.me
                .querySelector('.sections')
                .getElementsByClassName('section');

            for (let i = 0; i < sections.length; i++) {
                let category_btns = sections[i].getElementsByClassName('category-btn');

                if (category_btns && category_btns.length) {
                    fireClick(category_btns[0]);
                }
            }
        }
    },
    setOptions: function () {
        let html = ``;

        let sections = befriend.me.data.sections.options;

        if (sections) {
            for (let key in sections) {
                let section = sections[key];

                html += `<div class="option" data-key="${section.section_key}">
                        <div class="icon">${section.icon}</div>
                        <div class="name">${section.section_name}</div>
                        <div class="add">
                            Add
                            <svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 266.7608 511.9493"><path d="M263.6408,248.3075L18.3078,2.9745C14.0408-1.0785,7.3208-.9725,3.2678,3.1875-.6792,7.3475-.6792,13.8545,3.2678,18.0145l237.76,237.76L3.2678,493.6415c-4.267,4.053-4.373,10.88-.213,15.04,4.053,4.267,10.88,4.373,15.04.213.107-.107.213-.213.213-.213l245.333-245.333c4.16-4.161,4.16-10.881,0-15.041Z"/></svg>
                        </div>
                    </div>`;
            }

            befriend.els.meSectionOptions.querySelector('.options').innerHTML = html;
        }
    },
    searchItems: function (section_key, search_value) {
        return new Promise(async (resolve, reject) => {
            search_value = search_value ? search_value.trim() : '';

            let sectionAutocomplete = befriend.me.getSectionAutoComplete(section_key);

            let minChars = isNumeric(sectionAutocomplete.minChars) ? sectionAutocomplete.minChars : befriend.me.autoComplete.minChars;

            if (search_value.length < minChars) {
                befriend.me.toggleAutoComplete(null);
                return resolve();
            }

            try {
                let category_name = null, category_token = null, table_key = null;

                let section_el = befriend.me.getSectionElByKey(section_key);

                let endpoint =
                    befriend.me.getSectionAutoComplete(section_key).endpoint;

                let filterId =
                    befriend.me.autoComplete.selected.filterList[section_key]?.item?.id || null;

                let active_category = section_el.querySelector('.category-btn.active');

                if(active_category) {
                    category_name = active_category.getAttribute('data-category') || null;
                    category_token = active_category.getAttribute('data-category-token');
                    table_key = active_category.getAttribute('data-category-table') || befriend.me.getSectionTableKey(section_key) || null;
                }

                const r = await befriend.auth.get(endpoint, {
                    search: search_value,
                    filterId: filterId,
                    location: befriend.location.device || null,
                    category: {
                        name: category_name,
                        token: category_token,
                        table: table_key
                    }
                });

                befriend.me.setAutoComplete(section_key, r.data.items);
            } catch (error) {
                console.error('Search error:', error);
            }
        });
    },
    setAutoComplete: async function (section_key, items) {
        let section_el = befriend.me.getSectionElByKey(section_key);

        let search_container_el = section_el.querySelector('.search-container');

        if (search_container_el) {
            let list = search_container_el.querySelector('.autocomplete-list');

            if (list) {
                let section_data = befriend.me.getActiveSection(section_key);
                let auto_compete_data = section_data.data.autoComplete;
                let items_html = '';

                if(auto_compete_data.groups && Object.keys(auto_compete_data.groups).length) {
                    for(let k in auto_compete_data.groups) {
                        let group = auto_compete_data.groups[k];

                        let group_html = '';

                        let groupItems = items[k];

                        if(groupItems && groupItems.length) {
                            for(let item of groupItems) {
                                if (item.token in section_data.items) {
                                    continue;
                                }

                                let location_html = '';

                                if(item.city) {
                                    if(item.state) {
                                        location_html = `<div class="location">${item.city}, ${item.state}</div>`;
                                    } else {
                                        location_html = `<div class="location">${item.city}</div>`;
                                    }
                                }

                                group_html += `<div class="item" data-token="${item.token}">
                                                   ${location_html}
                                                   <div class="name">${item.name}</div>
                                              </div>`;
                            }

                            if(group_html) {
                                items_html += `<div class="group">
                                            <div class="group-name">${group.name}</div>
                                            <div class="group-list">${group_html}</div>
                                        </div>`;
                            }
                        }
                    }
                } else {
                    if (items) {
                        for (let item of items) {
                            if (item.token in section_data.items) {
                                continue;
                            }

                            let meta = '';

                            if(item.meta) {
                                meta = `<div class="meta">${item.meta}</div>`;
                            }

                            items_html += `<div class="item" data-token="${item.token}">
                                                <div class="name">${item.name}</div>
                                                ${meta}
                                            </div>`;
                        }
                    }
                }

                if (!items_html) {
                    items_html = `<div class="no-results">No results</div>`;
                }

                list.innerHTML = items_html;

                befriend.me.toggleAutoComplete(search_container_el, true);

                //reset scroll
                list.scrollTop = 0;

                befriend.me.events.onSelectAutoCompleteItem();
            }
        }
    },
    isAutoCompleteShown: function () {
        let el = befriend.els.me.querySelector(
            `.search-container.${befriend.classes.autoCompleteMe}`,
        );

        return !!el;
    },
    isAutoCompleteSelectShown: function () {
        let el = befriend.els.me.querySelector(`.search-container .select-container.open`);

        return !!el;
    },
    updateCollapsed: async function () {
        await rafAwait();

        //initialize height for transition
        let section_els = befriend.els.me
            .querySelector('.sections')
            .getElementsByClassName('section');

        for (let i = 0; i < section_els.length; i++) {
            let el = section_els[i];

            let key = el.getAttribute('data-key');

            let collapse = false;

            if (key in befriend.me.data.sections.collapsed) {
                collapse = befriend.me.data.sections.collapsed[key];
            }

            befriend.me.updateSectionHeight(el, collapse, false, true);
        }
    },
    isSectionOptionsShown: function () {
        return elHasClass(document.documentElement, befriend.classes.availableMeSections);
    },
    toggleSectionOptions: function (show) {
        if (show) {
            addClassEl(befriend.classes.availableMeSections, document.documentElement);
        } else {
            removeClassEl(befriend.classes.availableMeSections, document.documentElement);
        }
    },
    toggleSectionActions: function (el, show) {
        if (show) {
            addClassEl('show-menu', el);
        } else {
            removeClassEl('show-menu', el);
        }
    },
    transitionSecondaryT: null,
    transitionSecondary: function (secondary_el, show) {
        clearTimeout(this.transitionSecondaryT);

        let options_el = secondary_el.querySelector('.options');

        let items_container_el = secondary_el.closest('.items-container');

        items_container_el.style.setProperty('overflow-y', 'initial');

        if (show) {
            addClassEl('secondary-open', secondary_el.closest('.section'));

            setElHeightDynamic(options_el);
        } else {
            removeClassEl('secondary-open', secondary_el.closest('.section'));

            options_el.style.removeProperty('height');
        }

        this.transitionSecondaryT = setTimeout(function () {
            items_container_el.style.removeProperty('overflowY');
        }, 300);
    },
    updateSectionHeightT: {},
    updateSectionHeight: async function (el, collapse, no_transition, skip_save) {
        let section_container = el.querySelector('.section-container');
        let section_key = el.getAttribute('data-key');

        if (no_transition) {
            section_container.style.transition = 'none';
            await rafAwait();
        }

        clearTimeout(befriend.me.updateSectionHeightT[section_key]);
        section_container.style.removeProperty('overflow-y');

        if (collapse) {
            addClassEl('collapsed', el);
            section_container.style.height = 0;
        } else {
            removeClassEl('collapsed', el);
            setElHeightDynamic(section_container);

            befriend.me.updateSectionHeightT[section_key] = setTimeout(function () {
                section_container.style.overflowY = 'initial';
            }, 300);
        }

        if (!skip_save) {
            befriend.me.data.sections.collapsed[section_key] = collapse;

            befriend.user.setLocal('me.sections.collapsed', befriend.me.data.sections.collapsed);
        }

        await rafAwait();

        section_container.style.removeProperty('transition');
    },
    isConfirmActionShown: function () {
        return elHasClass(document.documentElement, befriend.classes.confirmMeAction);
    },
    toggleAutoComplete: function (el, show) {
        if (!el) {
            el = befriend.els.me.querySelector(
                `.search-container.${befriend.classes.autoCompleteMe}`,
            );
        }

        if (!el) {
            return;
        }

        if (show) {
            addClassEl(befriend.classes.autoCompleteMe, el);
            addClassEl('autocomplete-shown', befriend.els.me);
        } else {
            removeClassEl(befriend.classes.autoCompleteMe, el);
            removeClassEl('autocomplete-shown', befriend.els.me);
        }
    },
    toggleAutoCompleteSelect: function (el, show) {
        if (!el) {
            el = befriend.els.me.querySelector('.search-container .select-container.open');
        }

        let section_el = el.closest('.section');

        let section_key = section_el.getAttribute('data-key');

        if (show) {
            let input = el.querySelector('.select-input');
            input.value = '';
            input.focus();
            befriend.me.updateAutoCompleteSelectList(section_key);

            //show el
            addClassEl('open', el);

            section_el.style.zIndex = 100;
        } else {
            removeClassEl('open', el);

            section_el.style.removeProperty('z-index');
        }
    },
    updateAutoCompleteSelectList(section_key) {
        function filterSort(items, search) {
            if (!search) {
                //show selected country at top of list
                let selectedItem = befriend.me.autoComplete.selected.filterList[section_key]?.item;

                if (selectedItem) {
                    let updated_items = [selectedItem];

                    for (let item of items) {
                        if (item.id !== selectedItem.id) {
                            updated_items.push(item);
                        }
                    }

                    return updated_items;
                } else {
                    return items;
                }
            }

            search = search.toLowerCase();

            const startsWithMatch = [];
            const wordStartsWithMatch = [];
            const includesMatch = [];

            for (let item of items) {
                let nameLower = item.name.toLowerCase();
                let words = nameLower.split(' ');

                if (nameLower.startsWith(search)) {
                    startsWithMatch.push(item);
                } else if (words.slice(1).some((word) => word.startsWith(search))) {
                    wordStartsWithMatch.push(item);
                } else if (nameLower.includes(search)) {
                    includesMatch.push(item);
                }
            }

            // Combine all matches in priority order
            return startsWithMatch.concat(wordStartsWithMatch).concat(includesMatch);
        }

        let section_el = befriend.me.getSectionElByKey(section_key);

        let select_input = section_el.querySelector('.select-input');

        let search_value = select_input.value;

        let select_list = section_el.querySelector('.select-list');

        let section_data = befriend.me.getActiveSection(section_key);

        if (!section_data || !section_data.autoComplete || !section_data.autoComplete.filterList) {
            return;
        }

        let list_items = section_data.autoComplete.filterList;

        let filtered_items = filterSort(list_items, search_value);

        let select_container_el = section_el.querySelector('.select-container');

        if (!filtered_items.length) {
            addClassEl('no-items', select_container_el);
            select_list.innerHTML = '';
        } else {
            removeClassEl('no-items', select_container_el);

            let list_html = '';

            for (let item of filtered_items) {
                let emoji = '';

                if (item.emoji) {
                    emoji = `<div class="emoji">${item.emoji}</div>`;
                }

                list_html += `<div class="item" data-id="${item.id}">
                            ${emoji}
                            <div class="name">${item.name}</div>
                        </div>`;
            }

            select_list.innerHTML = list_html;

            befriend.me.events.autoCompleteFilterList();
        }
    },
    toggleConfirm: function (show) {
        if (show) {
            addClassEl(befriend.classes.confirmMeAction, document.documentElement);
        } else {
            removeClassEl(befriend.classes.confirmMeAction, document.documentElement);
        }
    },
    sectionItemHtml: function (section_key, table_key, item) {
        let section_data = befriend.me.getActiveSection(section_key);
        let table_data = section_data.data.tables?.find(item => item.name === table_key);
        let section_type = section_data.data?.type?.name;

        if(['buttons'].includes(section_type)) {
            return befriend.me.sectionItemOptionHtml(section_key, table_key, item);
        }

        let favorite_html = '';
        let secondary_html = '';
        let secondary_options_html = '';

        let secondary_options = section_data.data?.secondary?.options;

        let isFavorable = table_data?.isFavorable;

        //favorable
        if(isFavorable) {
            favorite_html = `<div class="favorite heart">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 439.9961">
                                  <path class="outline" d="M240,422.9023c-29.3828-16.2148-224-129.4961-224-282.9023,0-66.0547,54.1992-124,116-124,41.8672.0742,80.4609,22.6602,101.0312,59.1289,1.5391,2.3516,4.1602,3.7656,6.9688,3.7656s5.4297-1.4141,6.9688-3.7656c20.5703-36.4688,59.1641-59.0547,101.0312-59.1289,61.8008,0,116,57.9453,116,124,0,153.4062-194.6172,266.6875-224,282.9023Z"/>
                                </svg>
                            </div>`;
        }

        //secondary
        if (secondary_options) {
            let unselected = '';

            if (!item.secondary) {
                unselected = 'unselected';
            }

            for (let option of secondary_options) {
                let selected = item.secondary === option ? 'selected' : '';

                secondary_options_html += `<div class="option ${selected}" data-option="${option}">${option}</div>`;
            }

            secondary_html = `<div class="secondary ${unselected}" data-value="${item.secondary ? item.secondary : ''}">
                                                    <div class="current-selected">${item.secondary ? item.secondary : section_data.data?.secondary?.unselectedStr}</div>
                                                    <svg class="arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 82.1 43.2"><path d="M41.1,43.2L0,2.2,2.1,0l39,39L80,0l2.1,2.2-41,41Z"/></svg>
                                                    <div class="options">${secondary_options_html}</div>
                                                </div>`;
        }

        return `<div class="item mine ${isFavorable ? 'favorable': ''} ${item.is_favorite ? 'is-favorite' : ''}" data-token="${item.token}" data-table-key="${item.table_key ? item.table_key : ''}">
                                                            <div class="content">
                                                                    <div class="rank">${isNumeric(item.favorite_position) ? item.favorite_position : ''}</div>
                                                                    <div class="name-favorite">
                                                                        ${favorite_html}
                                                                        <div class="name">${item.name}</div>
                                                                    </div>
                                                                
                                                                    ${secondary_html}
                                                                    <div class="remove">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 121.805 14.619"><path d="M7.308,14.619h107.188c4.037,0,7.309-3.272,7.309-7.31s-3.271-7.309-7.309-7.309H7.308C3.272.001,0,3.273,0,7.31s3.272,7.309,7.308,7.309Z"/></svg>
                                                                    </div>
                                                            </div>
                                                        </div>`;
    },
    sectionItemOptionHtml: function (section_key, table_key, item) {
        let section_data = befriend.me.getActiveSection(section_key);
        let section_type = section_data.data?.type;

        if (section_type?.name === 'buttons') {
            let is_selected = false;

            //select previously selected options
            if (section_type.name === 'buttons' && section_data.items) {
                is_selected = Object.values(section_data.items).some(
                    selected_item => selected_item.token === item.token
                );
            }

            return `<div class="item button-option ${is_selected ? 'selected' : ''}" 
                     data-token="${item.token}" 
                     data-table-key="${table_key}">
                    <div class="content">
                        <div class="name">${item.name}</div>
                    </div>
                </div>`;
        }
    },
    updateSectionItems: function(section_el, filter_params = {}) {
        return new Promise(async (resolve, reject) => {
            try {
                let section_key = section_el.getAttribute('data-key');
                let section_data = befriend.me.getActiveSection(section_key);
                let table_key = befriend.me.getSectionTableKey(section_key);
                let items_html = '';

                // Extract filter parameters
                const {
                    category = '',
                    category_token = null,
                    category_table_key = '',
                    tab_key = null
                } = filter_params;

                // Update table key if provided
                if(category_table_key) {
                    section_el.setAttribute('data-table-key', category_table_key);
                }

                // Get container to handle scroll
                let container_el = section_el.querySelector('.items-container');

                // Cancel any ongoing smooth scroll
                if (container_el) {
                    container_el.style.scrollBehavior = 'auto';
                    container_el.style.overflowY = 'hidden';
                }

                let resetScroll = false;

                // Handle "my items" view
                if (category === 'mine' || !category) {
                    addClassEl('my-items', section_el);

                    let items_filtered = [];

                    for (let token in section_data.items) {
                        let item = section_data.items[token];

                        // Filter by tab if exists
                        if (tab_key && item.table_key && item.table_key !== tab_key) {
                            continue;
                        }

                        items_filtered.push(item);
                    }

                    if(items_filtered.length) {
                        // Sort favorite items first by position, then default
                        items_filtered.sort((a, b) => {
                            if (a.is_favorite && !b.is_favorite) return -1;
                            if (!a.is_favorite && b.is_favorite) return 1;
                            if (a.is_favorite && b.is_favorite) {
                                return (a.favorite_position || 0) - (b.favorite_position || 0);
                            }

                            return 0;
                        });

                        for (let item of items_filtered) {
                            items_html += befriend.me.sectionItemHtml(section_key, table_key, item);
                        }

                        removeClassEl('no-items', section_el);
                    } else {
                        addClassEl('no-items', section_el);
                    }
                } else {
                    removeClassEl('my-items', section_el);
                    removeClassEl('no-items', section_el);

                    // Handle category-based options
                    if (category_token) {
                        let category_options = befriend.me.data.categories[category_token];

                        try {
                            if (!category_options) {
                                befriend.toggleSpinner(true);
                                category_options = await befriend.me.getCategoryOptions(
                                    section_data.data.categories.endpoint,
                                    category_token
                                );

                                befriend.toggleSpinner(false);

                                befriend.me.data.categories[category_token] = category_options;

                                resetScroll = true;
                            }

                            for (let item of category_options.items) {
                                if (!(item.token in section_data.items)) {
                                    let label = '';

                                    if(item.label) {
                                        label = `<div class="label">${item.label}</div>`;
                                    }

                                    items_html += `<div class="item" data-token="${item.token}">
                                                ${label}
                                                <div class="name">${item.name}</div>
                                            </div>`;
                                }
                            }
                        } catch(e) {
                            console.error('Error fetching category options:', e);
                        }
                    } else {
                        // Filter options by category
                        for (let item of section_data.data.options) {
                            if (item.category?.toLowerCase() === category.toLowerCase() &&
                                !(item.token in section_data.items)) {
                                items_html += `<div class="item" data-token="${item.token}">
                                                ${item.name}
                                            </div>`;
                            }
                        }
                    }
                }

                // Update DOM
                let section_items_el = section_el.querySelector('.items');
                section_items_el.innerHTML = items_html;

                //update row-cols class
                let rowColCls = befriend.me.getRowColsClass(section_data, category);

                //remove previous cls
                for(let i = 0; i < section_items_el.classList.length; i++) {
                    let cls = section_items_el.classList[i];

                    if(cls.startsWith('col')) {
                        removeClassEl(cls, section_items_el);
                    }
                }

                addClassEl(rowColCls, section_items_el);

                // Reattach event handlers
                befriend.me.events.onSelectItem();
                befriend.me.events.onSelectOptionItem();
                befriend.me.events.onRemoveItem();
                befriend.me.events.onFavorite();
                befriend.me.events.onOpenSecondary();
                befriend.me.events.onSelectSecondary();

                // Update UI height
                befriend.me.updateSectionHeight(section_el, elHasClass(section_el, 'collapsed'));

                //reset scroll to top
                if(resetScroll) {
                    container_el.scrollTop = 0;
                }

                //reset scroll properties
                requestAnimationFrame(() => {
                    container_el.style.removeProperty('scroll-behavior');
                    container_el.style.removeProperty('overflow-y');
                });

                resolve();
            } catch(e) {
                console.error('Error updating section items:', e);
                reject(e);
            } finally {
                befriend.toggleSpinner(false);
            }
        });
    },
    getFavoriteHighestPosition: function(section_key, table_key) {
        let section_data = this.getActiveSection(section_key);
        let highest = 0;

        if (!section_data?.items) {
            return highest;
        }

        for (let token in section_data.items) {
            let item = section_data.items[token];

            if (item.table_key === table_key && item.is_favorite && item.favorite_position) {
                highest = Math.max(highest, item.favorite_position);
            }
        }

        return highest;
    },
    reorderFavoritePositions: function(section_key, table_key) {
        let section_data = this.getActiveSection(section_key);
        let reorderedItems = [];
        let positions = {};

        // Get all favorited items for this table
        for (let token in section_data.items) {
            let item = section_data.items[token];

            if (item.table_key === table_key && item.is_favorite) {
                reorderedItems.push(item);
            }
        }

        // Sort by current positions
        reorderedItems.sort((a, b) => a.favorite_position - b.favorite_position);

        // Reassign positions sequentially
        for(let index = 0; index < reorderedItems.length; index++) {
            let item = reorderedItems[index];
            let newPosition = index + 1;

            if (item.favorite_position !== newPosition) {
                item.favorite_position = newPosition;
                positions[item.token] = {
                    id: item.id,
                    token: item.token,
                    favorite_position: newPosition,
                };
            }
        }

        return positions;
    },
    getInitialPositions: (item_els) => {
        let positions = {};
        for(let item of Array.from(item_els)) {
            let rect = item.getBoundingClientRect();
            positions[item.getAttribute('data-token')] = {
                top: rect.top,
                height: rect.height,
                left: rect.left,
                width: rect.width
            };
        }
        return positions;
    },
    sortItemsByFavorite: (itemsArray, active_section) => {
        return itemsArray.sort((a, b) => {
            let aItem = active_section.items[a.getAttribute('data-token')];
            let bItem = active_section.items[b.getAttribute('data-token')];

            if (aItem.is_favorite && !bItem.is_favorite) return -1;
            if (!aItem.is_favorite && bItem.is_favorite) return 1;
            if (aItem.is_favorite && bItem.is_favorite) {
                return (aItem.favorite_position || 0) - (bItem.favorite_position || 0);
            }
            return 0;
        });
    },
    updateRankDisplays: (section_el, item_el, item, updatedPositions) => {
        // Update current item rank
        let rank_el = item_el.querySelector('.rank');
        rank_el.innerHTML = item.favorite_position || '';

        // Update other ranks if positions were reordered
        if (updatedPositions && Object.keys(updatedPositions).length) {
            for (let token in updatedPositions) {
                let item_el = section_el.querySelector(`.item[data-token="${token}"]`);
                if (item_el) {
                    item_el.querySelector('.rank').innerHTML = updatedPositions[token].favorite_position;
                }
            }
        }
    },
    calculateTargetPosition: (item_el, items_el, oldPositions, newOrder) => {
        // Find item's position in new order
        const itemToken = item_el.getAttribute('data-token');
        const itemIndex = newOrder.findIndex(el => el.getAttribute('data-token') === itemToken);

        const scrollContainer = items_el.closest('.items-container');

        // Get container dimensions
        const containerRect = scrollContainer.getBoundingClientRect();
        const containerScrollTop = scrollContainer.scrollTop;

        // Calculate new position based on grid layout
        const itemHeight = oldPositions[itemToken].height;
        const gridGap = befriend.variables.me_items_gap_tb;
        const targetTop = (itemIndex * (itemHeight + gridGap));

        // Determine if scroll is needed
        const containerVisibleHeight = containerRect.height;
        const scrollNeeded = targetTop < containerScrollTop ||
            (targetTop + itemHeight) > (containerScrollTop + containerVisibleHeight);

        if (scrollNeeded) {
            return {
                element: scrollContainer,
                scrollTop: targetTop - (containerVisibleHeight - itemHeight) / 2
            }
        }

        return null;
    },
    animateItemTransitions: (itemsArray, items_el, initialPositions, favorited_item_el) => {
        // Remove transition temporarily
        itemsArray.forEach(item => {
            item.style.transition = 'none';
        });

        // Calculate target scroll position before reordering
        let scrollTarget = null;
        if (favorited_item_el) {
            scrollTarget = befriend.me.calculateTargetPosition(
                favorited_item_el,
                items_el,
                initialPositions,
                itemsArray
            );
        }

        // Reposition items in DOM
        itemsArray.forEach(item => {
            items_el.appendChild(item);
        });

        // Force reflow to ensure transitions will work
        void items_el.offsetHeight;

        // Apply transitions from old positions to new positions
        requestAnimationFrame(() => {
            itemsArray.forEach(item => {
                const token = item.getAttribute('data-token');
                const oldPos = initialPositions[token];
                const newPos = item.getBoundingClientRect();

                if (oldPos && (oldPos.top !== newPos.top || oldPos.left !== newPos.left)) {
                    const deltaY = oldPos.top - newPos.top;
                    const deltaX = oldPos.left - newPos.left;

                    // Apply the initial offset
                    item.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

                    requestAnimationFrame(() => {
                        // Enable transitions
                        item.style.transition = 'transform 300ms ease-out';
                        // Move to final position
                        item.style.transform = '';
                    });
                }
            });

            // make sure favorited item is visible
            if (scrollTarget) {
                scrollTarget.element.scrollTo({
                    top: scrollTarget.scrollTop,
                    behavior: 'smooth'
                });
            }
        });

        // Clean up transitions after animation
        setTimeout(() => {
            itemsArray.forEach(item => {
                item.style.transition = '';
                item.style.transform = '';
            });
        }, 300);
    },
    events: {
        sectionReorder: {
            ip: false,
            start: {
                x: null,
                y: null,
            },
            el: null,
            itemsGap: 0,
            prevRect: null,
            sections: [],
            dragStarted: false,
            autoScroll: {
                animationFrame: null,
                scrolling: false,
                startPosition: null,
                targetPosition: null,
                startTime: null,
                duration: 250 // ms for scroll animation
            },
            isItemAbove: function (item) {
                return item.hasAttribute('data-is-above');
            },
            isItemToggled: function (item) {
                return item.hasAttribute('data-is-toggled');
            },
            getIdleSections: function (sectionsContainer) {
                let allSections = Array.from(sectionsContainer.querySelectorAll(`.section`));
                return allSections.filter(el => !elHasClass(el, 'is-draggable'));
            },
            setSectionsGap: function (idleSections) {
                if (idleSections.length <= 1) {
                    this.itemsGap = 0;
                    return;
                }

                this.itemsGap = befriend.variables.me_sections_gap_h;
            },
            initReorderSection: function (section) {
                addClassEl('is-draggable', section);
            },
            initSectionsState: function (reorderEl, idleSections) {
                const reorderRect = reorderEl.getBoundingClientRect();
                const reorderTop = reorderRect.top;

                for (let section of idleSections) {
                    const sectionRect = section.getBoundingClientRect();
                    if (sectionRect.top < reorderTop) {
                        section.dataset.isAbove = '';
                    }
                }
            },
            updateIdleSectionsStateAndPosition: function (reorderEl, sectionY) {
                const reorderElRect = reorderEl.getBoundingClientRect();
                const reorderElTop = reorderElRect.top;

                // Get idle sections and update their states based on position
                const idleSections = this.getIdleSections(reorderEl.parentElement);
                const draggingUp = sectionY < this.start.y;

                for (let section of idleSections) {
                    const sectionRect = section.getBoundingClientRect();
                    const sectionTop = sectionRect.top;
                    const topEl = section.querySelector('.section-top');
                    const topElBottom = topEl.getBoundingClientRect().bottom;

                    if(draggingUp) {
                        if (this.isItemAbove(section)) {
                            // Section is above the dragged section
                            if (reorderElTop <= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        } else {
                            // Section is below the dragged section
                            if (reorderElTop >= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        }
                    } else {
                        if (this.isItemAbove(section)) {
                            // Section is above the dragged section
                            if (reorderElTop <= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        } else {
                            // Section is below the dragged section
                            if (reorderElTop >= sectionTop) {
                                section.dataset.isToggled = '';
                            } else {
                                delete section.dataset.isToggled;
                            }
                        }
                    }
                }

                // Update positions
                for (let section of idleSections) {
                    if (this.isItemToggled(section)) {
                        const direction = this.isItemAbove(section) ? 1 : -1;
                        const transformY = direction * (reorderElRect.height + this.itemsGap);
                        section.style.transform = `translateY(${transformY}px)`;
                    } else {
                        section.style.transform = '';
                    }
                }
            },
            applyNewSectionOrder: async function (reorderEl) {
                const sectionsContainer = reorderEl.parentElement;
                const allSections = Array.from(sectionsContainer.children);

                // Get current positions of all sections
                const sectionPositions = new Map();

                for(let section of allSections) {
                    const rect = section.getBoundingClientRect();
                    sectionPositions.set(section, rect.top);
                }

                // Sort sections by their vertical position
                const sortedSections = Array.from(sectionPositions.entries())
                    .sort((a, b) => a[1] - b[1])
                    .map(entry => entry[0]);

                // Clean up temporary attributes
                for (let section of this.getIdleSections(sectionsContainer)) {
                    delete section.dataset.isAbove;
                    delete section.dataset.isToggled;
                    section.style.transition = 'none';
                    section.style.transform = '';

                    requestAnimationFrame(() => {
                        section.style.removeProperty('transition');
                    });
                }

                // Animate transition
                const reorderTransform = reorderEl.style.transform;
                const transformValues = reorderTransform.replace('translate(', '').replace(')', '').split(',');
                const prevTransform = {
                    x: parseInt(transformValues[0]),
                    y: parseInt(transformValues[1])
                };

                const reorderedBoxBefore = reorderEl.getBoundingClientRect();

                // Reorder in DOM based on vertical positions
                for (let section of sortedSections) {
                    sectionsContainer.appendChild(section);
                }

                const reorderedBoxAfter = reorderEl.getBoundingClientRect();

                // Remove animation temporarily
                reorderEl.style.transition = 'none';
                await rafAwait();

                // Update final position
                const xDiff = reorderedBoxBefore.left - reorderedBoxAfter.left;
                const yDiff = reorderedBoxBefore.top - reorderedBoxAfter.top;
                const tX = prevTransform.x + xDiff;
                const tY = prevTransform.y + yDiff;
                reorderEl.style.transform = `translate(${tX}px, ${tY}px)`;

                await rafAwait();
                reorderEl.style.removeProperty('transition');

                // Update positions in data and server
                this.updateSectionPositions(sortedSections);

                requestAnimationFrame(() => {
                    removeClassEl('is-draggable', reorderEl);
                    reorderEl.style.transform = '';
                });
            },
            updateSectionPositions: async function (sections) {
                let positions = {};
                let updates = {};

                // Get section keys and build position updates
                for (let i = 0; i < sections.length; i++) {
                    let section = sections[i];
                    let key = section.getAttribute('data-key');

                    if (befriend.me.data.sections.active[key]) {
                        positions[key] = i;
                        updates[key] = {
                            key: key,
                            position: i
                        };
                    }
                }

                // Update local data
                for (let key in positions) {
                    if (befriend.me.data.sections.active[key]) {
                        befriend.me.data.sections.active[key].position = positions[key];
                    }
                }

                // Update server
                if (Object.keys(updates).length) {
                    try {
                        await befriend.auth.put('/me/sections/positions', {
                            positions: updates
                        });
                    } catch (e) {
                        console.error('Error updating section positions:', e);
                    }
                }
            },
        },
        itemReorder: {
            ip: false,
            start: {
                x: null,
                y: null,
            },
            el: null,
            itemsGap: 0,
            prevRect: null,
            items: [],
            autoScroll: {
                animationFrame: null,
                scrolling: false,
                startPosition: null,
                targetPosition: null,
                startTime: null,
                duration: 250 // ms for scroll animation
            },
            dragStarted: false,
            isItemAbove: function (item) {
                return item.hasAttribute('data-is-above');
            },
            isItemToggled: function (item) {
                return item.hasAttribute('data-is-toggled');
            },
            getIdleItems: function (itemsContainer) {
                let allItems = Array.from(itemsContainer.querySelectorAll('.item.is-favorite'));

                return allItems.filter(el => !elHasClass(el, 'is-draggable'));
            },
            setItemsGap: function (idleItems) {
                if (idleItems.length <= 1) {
                    this.itemsGap = 0;
                    return;
                }

                this.itemsGap = befriend.variables.me_items_gap_tb;

            },
            initReorderItem: function (item) {
                addClassEl('is-draggable', item);
            },
            initItemsState: function (reorderEl, idleItems) {
                for(let i = 0; i < idleItems.length; i++) {
                    let item = idleItems[i];

                    if (Array.from(reorderEl.parentElement.children).indexOf(reorderEl) > i) {
                        item.dataset.isAbove = '';
                    }
                }
            },
            updateIdleItemsStateAndPosition: function (reorderEl) {
                const reorderElRect = reorderEl.getBoundingClientRect();
                const reorderElY = reorderElRect.top + reorderElRect.height / 2;

                // Update state
                for(let item of this.getIdleItems(reorderEl.parentElement)) {
                    const itemRect = item.getBoundingClientRect();
                    const itemY = itemRect.top + itemRect.height / 2;
                    if (this.isItemAbove(item)) {
                        if (reorderElY <= itemY) {
                            item.dataset.isToggled = '';
                        } else {
                            delete item.dataset.isToggled;
                        }
                    } else {
                        if (reorderElY >= itemY) {
                            item.dataset.isToggled = '';
                        } else {
                            delete item.dataset.isToggled;
                        }
                    }
                }

                // Update position
                for(let item of this.getIdleItems(reorderEl.parentElement)) {
                    if (this.isItemToggled(item)) {
                        const direction = this.isItemAbove(item) ? 1 : -1;
                        item.style.transform = `translateY(${
                            direction * (reorderElRect.height + this.itemsGap)
                        }px)`;
                    } else {
                        item.style.transform = '';
                    }
                }
            },
            applyNewItemOrder: async function (reorderEl, section_el, section_key) {
                const reorderedItems = [];
                const itemsContainer = reorderEl.parentElement;
                const allItems = Array.from(itemsContainer.children);

                let prevIndex = allItems.indexOf(reorderEl);
                let skipUpdate = false;

                for(let i = 0; i < allItems.length; i++) {
                    let item = allItems[i];

                    if (item === reorderEl) {
                        continue;
                    }

                    if (!this.isItemToggled(item)) {
                        reorderedItems[i] = item;
                        continue;
                    }

                    const newIndex = this.isItemAbove(item) ? i + 1 : i - 1;
                    reorderedItems[newIndex] = item;
                }

                // Fill in the dragged item
                for (let index = 0; index < allItems.length; index++) {
                    if (typeof reorderedItems[index] === 'undefined') {
                        if(prevIndex === index) {
                            skipUpdate = true;
                            break;
                        }
                        reorderedItems[index] = reorderEl;
                    }
                }

                // Clean up temporary attributes
                for(let item of this.getIdleItems(itemsContainer)) {
                    delete item.dataset.isAbove;
                    delete item.dataset.isToggled;
                    item.style.transition = 'none';
                    item.style.transform = '';

                    requestAnimationFrame(() => {
                        item.style.removeProperty('transition');
                    });
                }

                if(skipUpdate) {
                    return requestAnimationFrame(() => {
                        removeClassEl('is-draggable', reorderEl);
                        reorderEl.style.transform = '';
                    });
                }

                // Update DOM and positions
                const reorderTransform = reorderEl.style.transform;
                const transformValues = reorderTransform.replace('translate(', '').replace(')', '').split(',');
                const prevTransform = {
                    x: parseInt(transformValues[0]),
                    y: parseInt(transformValues[1])
                };

                const reorderedBoxBefore = reorderEl.getBoundingClientRect();

                // Reorder items in DOM
                for(let item of reorderedItems) {
                    itemsContainer.appendChild(item);
                }

                const reorderedBoxAfter = reorderEl.getBoundingClientRect();

                //remove animation
                reorderEl.style.transition = 'none';

                await rafAwait();

                // Update final position
                const xDiff = reorderedBoxBefore.left - reorderedBoxAfter.left;
                const yDiff = reorderedBoxBefore.top - reorderedBoxAfter.top;
                const tX = prevTransform.x + xDiff;
                const tY = prevTransform.y + yDiff;
                reorderEl.style.transform = `translate(${tX}px, ${tY}px)`;

                await rafAwait();

                reorderEl.style.removeProperty('transition');

                // Update positions in data model
                this.updateFavoritePositions(section_key, section_el);

                requestAnimationFrame(() => {
                    addClassEl('is-drag-ending', reorderEl);
                    removeClassEl('is-draggable', reorderEl);
                    reorderEl.style.transform = '';
                    setTimeout(function () {
                        removeClassEl('is-drag-ending', reorderEl);
                    }, 1000);
                });
            },
            updateFavoritePositions: async function (section_key, section_el) {
                const active_section = befriend.me.getActiveSection(section_key);
                const items_el = section_el.querySelector('.items');
                const item_els = items_el.querySelectorAll('.item.is-favorite');
                let positions = {};

                for(let i = 0; i < item_els.length; i++) {
                    let item_el = item_els[i];

                    const token = item_el.getAttribute('data-token');
                    const item = active_section.items[token];
                    const newPosition = i + 1;

                    if (item.favorite_position !== newPosition) {
                        item.favorite_position = newPosition;
                        positions[token] = {
                            id: item.id,
                            token: token,
                            favorite_position: newPosition
                        };
                    }

                    const rank_el = item_el.querySelector('.rank');

                    if (rank_el) {
                        rank_el.innerHTML = newPosition;
                    }
                }

                if (Object.keys(positions).length) {
                    try {
                        await befriend.auth.put(`/me/sections/item`, {
                            section_key: section_key,
                            table_key: section_el.getAttribute('data-table-key'),
                            section_item_id: Object.values(positions)[0].id,
                            favorite: {
                                reorder: positions
                            }
                        });
                    } catch (e) {
                        console.error('Error updating favorite positions:', e);
                    }
                }
            }
        },
        init: function () {
            return new Promise(async (resolve, reject) => {
                befriend.me.events.onAddSectionBtn();
                befriend.me.events.onSelectAvailableSection();
                befriend.me.events.confirmAction();

                resolve();
            });
        },
        onAddSectionBtn: function () {
            //open available sections
            let btn_el = befriend.els.me.querySelector('.add-section-btn');

            btn_el.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                if (befriend.me.isSectionOptionsShown()) {
                    befriend.me.toggleSectionOptions(false);
                } else {
                    befriend.me.toggleSectionOptions(true);
                }
            });
        },
        onModeSelect: function () {
            const modeOptions = befriend.els.me.querySelectorAll('.mode-option');

            for(let option of modeOptions) {
                if(option._listener) continue;
                option._listener = true;

                option.addEventListener('click', function() {
                    removeElsClass(modeOptions, 'selected');
                    addClassEl('selected', this);

                    befriend.me.modes.selected = this.getAttribute('data-mode');
                });
            }
        },
        onSelectAvailableSection: function () {
            //add selected available section
            let options = befriend.els.meSectionOptions.getElementsByClassName('option');

            for (let i = 0; i < options.length; i++) {
                let option = options[i];

                if (option._listener) {
                    continue;
                }

                option._listener = true;

                option.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let key = this.getAttribute('data-key');

                    befriend.me.addSection(key);

                    this.parentNode.removeChild(this);
                });
            }
        },
        onSectionActions: function () {
            let actions_els = befriend.els.me.querySelectorAll('.section .actions');

            for (let i = 0; i < actions_els.length; i++) {
                let el = actions_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    removeElsClass(befriend.els.me.getElementsByClassName('section'), 'show-menu');

                    let section_el = this.closest('.section');

                    befriend.me.toggleSectionActions(section_el, true);

                    befriend.me.toggleAutoComplete(null, false);
                });
            }
        },
        onSectionReorder: function() {
            const TOUCH_DELAY = 80;
            const MOVE_THRESHOLD = 10;
            let touchTimeout;
            let initialTouchY;
            let hasMoved;

            const sectionReorder = befriend.me.events.sectionReorder;
            const sections = befriend.els.me.getElementsByClassName('section');

            for(let i = 0; i < sections.length; i++) {
                let section = sections[i];

                if(section._reorder_listener) {
                    continue
                };

                section._reorder_listener = true;

                // Track touch move before drag starts
                section.addEventListener('touchmove', function(e) {
                    if (sectionReorder.ip) {
                        e.preventDefault();
                        return;
                    }

                    if(!initialTouchY) return;

                    const touch = e.touches[0];
                    const moveDistance = Math.abs(touch.clientY - initialTouchY);

                    if (moveDistance > MOVE_THRESHOLD) {
                        hasMoved = true;
                        clearTimeout(touchTimeout);
                        initialTouchY = null;
                    }
                }, {
                    passive: false
                });

                section.addEventListener('touchstart', function(e) {
                    // Only handle drag start from section top area
                    const target = e.target;
                    const sectionTop = section.querySelector('.section-top');
                    if (!sectionTop.contains(target)) return;

                    if (target.closest('.actions') || target.closest('.menu')) return;

                    // Reset tracking variables
                    hasMoved = false;
                    initialTouchY = e.touches[0].clientY;

                    clearTimeout(touchTimeout);
                    touchTimeout = setTimeout(function() {
                        if(!hasMoved) {
                            e.preventDefault();
                            e.stopPropagation();

                            const coords = getEventCoords(e);
                            sectionReorder.start.x = coords.x;
                            sectionReorder.start.y = coords.y;
                            sectionReorder.el = section;
                            sectionReorder.ip = true;
                            sectionReorder.dragStarted = false;

                            // Disable scrolling
                            const scrollContainer = section.closest('.view-me');
                            if (scrollContainer) {
                                scrollContainer.style.overflow = 'hidden';
                            }

                            const idleSections = sectionReorder.getIdleSections(section.parentElement);
                            sectionReorder.setSectionsGap(idleSections);
                            sectionReorder.initReorderSection(section);
                            sectionReorder.initSectionsState(section, idleSections);
                        }
                    }, TOUCH_DELAY);
                });
            }
        },
        autoComplete: function () {
            let els = befriend.els.me.getElementsByClassName('search-input');

            for (let i = 0; i < els.length; i++) {
                let el = els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                let debounceTimer = null;

                el.addEventListener('input', function () {
                    clearTimeout(debounceTimer);

                    debounceTimer = setTimeout(async function () {
                        const value = el.value;

                        let section_key = el.closest('.section').getAttribute('data-key');

                        try {
                            befriend.me.searchItems(section_key, value);
                        } catch (e) {
                            console.error(e);
                        }
                    }, 100);
                });

                //focus
                el.addEventListener('focus', function () {
                    addClassEl('input-focus', el.closest('.input-container'));

                    //hide all other dropdowns
                    let search_containers =
                        befriend.els.me.getElementsByClassName('search-container');

                    removeElsClass(search_containers, befriend.classes.autoCompleteMe);

                    let section_key = el.closest('.section').getAttribute('data-key');

                    let sectionAutocomplete = befriend.me.getSectionAutoComplete(section_key);

                    let minChars = isNumeric(sectionAutocomplete.minChars) ? sectionAutocomplete.minChars : befriend.me.autoComplete.minChars;

                    if (el.value.length >= minChars) {
                        befriend.me.toggleAutoComplete(el.closest('.search-container'), true);
                    }
                });

                el.addEventListener('blur', function () {
                    removeClassEl('input-focus', el.closest('.input-container'));
                });
            }
        },
        autoCompleteFilterList: function () {
            //open list
            let selected_els = befriend.els.me.querySelectorAll(
                '.search-container .selected-container',
            );

            for (let i = 0; i < selected_els.length; i++) {
                let el = selected_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    let parent_el = el.closest('.select-container');
                    let section_key = el.closest('.section').getAttribute('data-key');

                    befriend.me.toggleAutoCompleteSelect(parent_el, !elHasClass(parent_el, 'open'));

                    //reset scroll to top after selection
                    if (befriend.me.autoComplete.selected.filterList[section_key]?.needsReset) {
                        let list = parent_el.querySelector('.select-list');

                        requestAnimationFrame(function () {
                            list.scrollTop = 0;
                        });

                        befriend.me.autoComplete.selected.filterList[section_key].needsReset =
                            false;
                    }
                });
            }

            //search list
            let input_els = befriend.els.me.querySelectorAll('.select-container input');

            for (let i = 0; i < input_els.length; i++) {
                let el = input_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('input', function (e) {
                    let section_key = el.closest('.section').getAttribute('data-key');

                    befriend.me.updateAutoCompleteSelectList(section_key);
                });
            }

            //select list item
            let item_els = befriend.els.me.querySelectorAll('.select-container .item');

            for (let i = 0; i < item_els.length; i++) {
                let el = item_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let section_key = el.closest('.section').getAttribute('data-key');

                    let id = this.getAttribute('data-id');

                    befriend.me.selectAutoCompleteFilterItem(section_key, id);
                });
            }
        },
        onActionSelect: function () {
            let actions_els = befriend.els.me.querySelectorAll('.menu .action');

            for (let i = 0; i < actions_els.length; i++) {
                let el = actions_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    let action = this.getAttribute('data-action');

                    let section = this.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let section_data = befriend.me.data.sections.all[section_key];

                    if (action === 'delete') {
                        befriend.me.actions.delete.section = section_key;
                        befriend.els.confirmMeAction.querySelector('.main').innerHTML =
                            'Confirm Delete';
                        befriend.els.confirmMeAction.querySelector('.details').innerHTML =
                            section_data.section_name;

                        befriend.me.toggleConfirm(true);
                    }
                });
            }
        },
        onUpdateSectionHeight: function () {
            let top_els = befriend.els.me.getElementsByClassName('section-top');

            for (let i = 0; i < top_els.length; i++) {
                let el = top_els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', (e) => {
                    // e.preventDefault();
                    // e.stopPropagation();

                    if (e.target.closest('.actions')) {
                        return false;
                    }

                    let section_el = el.closest('.section');

                    //hide actions if shown
                    if (elHasClass(section_el, 'show-menu')) {
                        return befriend.me.toggleSectionActions(section_el, false);
                    }

                    befriend.me.updateSectionHeight(
                        section_el,
                        !elHasClass(section_el, 'collapsed'),
                    );
                });
            }
        },
        onSectionCategory: function() {
            let category_btns = befriend.els.me.getElementsByClassName('category-btn');

            for (let i = 0; i < category_btns.length; i++) {
                let btn = category_btns[i];

                if (!btn._listener) {
                    btn._listener = true;

                    btn.addEventListener('click', async function(e) {
                        let section_el = this.closest('.section');

                        // Update active state
                        let section_btns = section_el.getElementsByClassName('category-btn');
                        removeElsClass(section_btns, 'active');
                        addClassEl('active', this);

                        // Get filter parameters
                        const filter_params = {
                            category: this.getAttribute('data-category') || '',
                            category_token: this.getAttribute('data-category-token'),
                            category_table_key: this.getAttribute('data-category-table') || '',
                            tab_key: section_el.querySelector('.tab.active')?.getAttribute('data-key')
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch(e) {
                            console.error(e)
                        }
                    });
                }
            }
        },
        onSectionTabs: function() {
            let tab_els = befriend.els.me.querySelectorAll('.section-container .tab');

            for (let i = 0; i < tab_els.length; i++) {
                let el = tab_els[i];

                if (!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', async function(e) {
                        let section_el = this.closest('.section');

                        // Update active state
                        let section_tabs = section_el.querySelectorAll('.section-container .tab');
                        removeElsClass(section_tabs, 'active');
                        addClassEl('active', this);

                        // Get current category filter parameters
                        let active_category = section_el.querySelector('.category-btn.active');

                        const filter_params = {
                            category: active_category?.getAttribute('data-category') || '',
                            category_token: active_category?.getAttribute('data-category-token'),
                            category_table_key: active_category?.getAttribute('data-category-table') || '',
                            tab_key: this.getAttribute('data-key')
                        };

                        // Update items
                        try {
                            await befriend.me.updateSectionItems(section_el, filter_params);
                        } catch(e) {
                            console.error(e)
                        }
                    });
                }
            }
        },
        onSelectItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if(elHasClass(item,'button-option')) {
                    continue;
                }

                if (!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', function (e) {
                        let section_el = this.closest('.section');

                        if (elHasClass(item, 'mine')) {
                            let open_secondary_el =
                                befriend.els.me.querySelector('.secondary.open');

                            if (open_secondary_el && !e.target.closest('.secondary')) {
                                befriend.me.transitionSecondary(open_secondary_el, false);
                            }

                            return false;
                        }

                        let section_key = section_el.getAttribute('data-key');
                        let token = this.getAttribute('data-token');

                        try {
                            item.parentNode.removeChild(item);
                        } catch (e) {}

                        try {
                            befriend.me.addSectionItem(section_key, token);
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }
        },
        onSelectOptionItem: function () {
            let items = befriend.els.me.querySelector('.sections').querySelectorAll('.item.button-option');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                if (!item._listener) {
                    item._listener = true;

                    item.addEventListener('click', async function (e) {
                        console.log("on select option item");

                        if(item._request_ip) {
                            return false;
                        }

                        item._request_ip = true;

                        try {
                            let section_el = this.closest('.section');
                            let section_buttons = section_el.getElementsByClassName('button-option');
                            let section_key = section_el.getAttribute('data-key');
                            let table_key = befriend.me.getSectionTableKey(section_key);
                            let token = this.getAttribute('data-token');
                            let sectionData = befriend.me.getActiveSection(section_key).data;

                            let isSelect = !(elHasClass(item, 'selected'));
                            let exclusiveToken = sectionData?.type?.exclusive?.token;
                            let isExclusive = exclusiveToken === token;
                            let exclusiveButton = section_el.querySelector(`.button-option[data-token="${exclusiveToken}"]`);
                            let isExclusiveSelected = exclusiveButton && elHasClass(exclusiveButton, 'selected');

                            // If section is single-select or this is the exclusive token, deselect all others
                            if (!sectionData?.type?.multi || isExclusive) {
                                removeElsClass(section_buttons, 'selected');
                            }

                            // Toggle current item selection
                            if(isSelect) {
                                // If selecting non-exclusive and exclusive is selected, deselect exclusive
                                if (!isExclusive && isExclusiveSelected) {
                                    removeClassEl('selected', exclusiveButton);
                                }

                                addClassEl('selected', item);
                            } else {
                                removeClassEl('selected', item);
                            }

                            let r = await befriend.auth.put(`/me/sections/selection`, {
                                section_key: section_key,
                                table_key: table_key,
                                item_token: token,
                                is_select: isSelect
                            });

                            // Update section data
                            let section_data = befriend.me.getActiveSection(section_key);
                            if (!isSelect) {
                                delete section_data.items[token];
                            } else {
                                if (!isExclusive && isExclusiveSelected) {
                                    delete section_data.items[exclusiveToken];
                                }
                                section_data.items[token] = r.data;
                            }

                            // If exclusive item is selected, deselect all others
                            if (isExclusive && isSelect) {
                                for (let i = 0; i < section_buttons.length; i++) {
                                    let btn = section_buttons[i];
                                    if (btn !== item) {
                                        removeClassEl('selected', btn);
                                        let btnToken = btn.getAttribute('data-token');
                                        delete section_data.items[btnToken];
                                    }
                                }
                            }
                        } catch(e) {
                            console.error(e);
                        }

                        item._request_ip = false;
                    });
                }
            }
        },
        onRemoveItem: function () {
            let items = befriend.els.me.querySelector('.sections').getElementsByClassName('item');

            for (let i = 0; i < items.length; i++) {
                let item = items[i];

                let remove_el = item.querySelector('.remove');

                if (!remove_el || remove_el._listener) {
                    continue;
                }

                remove_el._listener = true;

                remove_el.addEventListener('click', async function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    try {
                        befriend.toggleSpinner(true);

                        let section_el = this.closest('.section');
                        let section_key = section_el.getAttribute('data-key');
                        let item_el = this.closest('.item');
                        let delete_token = item_el.getAttribute('data-token');

                        let section_data = befriend.me.getActiveSection(section_key);
                        let item = section_data.items[delete_token];
                        let table_key = item.table_key;

                        // Get initial positions for animation
                        let items_el = section_el.querySelector('.items-container .items');
                        let item_els = items_el.getElementsByClassName('item');
                        let initialPositions = befriend.me.getInitialPositions(item_els);

                        // Handle reordering if this was a favorited item
                        let updatedPositions;
                        let favorite_data = {
                            active: false,
                            position: null
                        };

                        if (item.is_favorite) {
                            // Remove favorite and reorder remaining favorites
                            item.is_favorite = false;
                            item.favorite_position = null;
                            favorite_data.reorder = updatedPositions = befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update server with both delete and reorder
                        try {
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                is_delete: true,
                                favorite: favorite_data
                            });
                        } catch (e) {
                            console.error(e);
                            return; // Don't proceed with UI updates if server update failed
                        }

                        // Remove from data
                        delete section_data.items[delete_token];

                        // Get remaining filtered items
                        let items_filtered = [];
                        for (let token in section_data.items) {
                            let item = section_data.items[token];

                            // Filter by tab if exists
                            let active_tab = section_el.querySelector('.section-container .tab.active');
                            if (active_tab && item.table_key && item.table_key !== active_tab.getAttribute('data-key')) {
                                continue;
                            }

                            let remaining_el = section_el.querySelector(`.item[data-token="${token}"]`);
                            if (remaining_el) {
                                items_filtered.push(remaining_el);
                            }
                        }

                        // Animate out the deleted item
                        item_el.style.transition = `opacity ${befriend.variables.me_remove_item_transition_ms}ms ease-out`;
                        item_el.style.opacity = '0';

                        await timeoutAwait(befriend.variables.me_remove_item_transition_ms);

                        // Remove the element after fade out
                        item_el.parentNode.removeChild(item_el);

                        // Handle animations and DOM updates
                        if (items_filtered.length > 0) {
                            // Sort and animate remaining items
                            let itemsArray = befriend.me.sortItemsByFavorite(items_filtered, section_data);
                            befriend.me.animateItemTransitions(itemsArray, items_el, initialPositions, null);

                            // Update rank displays for remaining favorites
                            if (updatedPositions) {
                                for (let token in updatedPositions) {
                                    let remaining_el = section_el.querySelector(`.item[data-token="${token}"]`);
                                    if (remaining_el) {
                                        let rank_el = remaining_el.querySelector('.rank');
                                        rank_el.innerHTML = updatedPositions[token].favorite_position;
                                    }
                                }
                            }

                            removeClassEl('no-items', section_el);
                        } else {
                            addClassEl('no-items', section_el);
                        }

                        // Update section height after removing the last item
                        befriend.me.updateSectionHeight(section_el, elHasClass(section_el, 'collapsed'));
                    } catch(e) {
                        console.error(e);
                    } finally {
                        befriend.toggleSpinner(false);
                    }
                });
            }
        },
        onOpenSecondary: function () {
            let secondaries = befriend.els.me.getElementsByClassName('secondary');

            for (let i = 0; i < secondaries.length; i++) {
                let el = secondaries[i];

                if (!el._listener) {
                    el._listener = true;

                    el.addEventListener('click', function (e) {
                        e.preventDefault();
                        e.stopPropagation();

                        if (e.target.closest('.options')) {
                            return false;
                        }

                        //hide all except current
                        for (let i2 = 0; i2 < secondaries.length; i2++) {
                            let secondary_2 = secondaries[i2];

                            if (el !== secondary_2) {
                                befriend.me.transitionSecondary(secondary_2, false);
                            }
                        }

                        if (elHasClass(el, 'open')) {
                            befriend.me.transitionSecondary(el, false);
                        } else {
                            befriend.me.transitionSecondary(el, true);
                        }
                    });
                }
            }
        },
        onFavorite: function () {
            let meReorder = befriend.me.events.itemReorder;

            let favorite_els = befriend.els.me.getElementsByClassName('favorite');

            for (let i = 0; i < favorite_els.length; i++) {
                let favorite_el = favorite_els[i];

                if(!favorite_el._listener) {
                    favorite_el._listener = true;

                    favorite_el.addEventListener('click', async function (e) {
                        if (meReorder.ip) return;

                        e.preventDefault();
                        e.stopPropagation();

                        //data
                        let section_el = this.closest('.section');
                        let items_el = section_el.querySelector('.items-container .items');
                        let item_els = items_el.getElementsByClassName('item');
                        let item_el = this.closest('.item');

                        let section_key = section_el.getAttribute('data-key');
                        let item_token = item_el.getAttribute('data-token');
                        let active_section = befriend.me.getActiveSection(section_key);
                        let item = active_section.items[item_token];
                        let table_key = item.table_key || befriend.me.getSectionTableKey(section_key);

                        //toggle favorite state
                        item.is_favorite = !item.is_favorite;
                        toggleElClass(this.closest('.item'), 'is-favorite');

                        // Get initial positions before any changes
                        let initialPositions = befriend.me.getInitialPositions(item_els);

                        // Handle favorite data updates
                        let updatedPositions;
                        let favorite_data = {
                            active: item.is_favorite
                        };

                        if(item.is_favorite) {
                            // Adding favorite - get highest position and add 1
                            let highest = befriend.me.getFavoriteHighestPosition(section_key, table_key);
                            item.favorite_position = highest + 1;
                            favorite_data.position = item.favorite_position;
                        } else {
                            // Removing favorite - reorder remaining favorites
                            item.favorite_position = null;
                            favorite_data.position = null;
                            favorite_data.reorder = updatedPositions = befriend.me.reorderFavoritePositions(section_key, table_key);
                        }

                        // Update rank displays
                        befriend.me.updateRankDisplays(section_el, item_el, item, updatedPositions);

                        // Sort and animate items
                        let itemsArray = Array.from(item_els);
                        itemsArray = befriend.me.sortItemsByFavorite(itemsArray, active_section);

                        befriend.me.animateItemTransitions(itemsArray, items_el, initialPositions,
                            item.is_favorite ? item_el : null
                            );

                        //server
                        try {
                            await befriend.auth.put(`/me/sections/item`, {
                                section_key: section_key,
                                table_key: table_key,
                                section_item_id: item.id,
                                favorite: favorite_data,
                            });
                        } catch (e) {
                            console.error(e);
                        }
                    });
                }
            }

            const TOUCH_DELAY = 80; // ms to wait before initiating drag
            const MOVE_THRESHOLD = 10; // pixels of movement to consider it a scroll
            let touchTimeout;
            let initialTouchY;
            let hasMoved;

            let item_els = befriend.els.me.getElementsByClassName('item');

            for (let i = 0; i < item_els.length; i++) {
                let item_el = item_els[i];

                if(!elHasClass(item_el, 'favorable')) {
                    continue;
                }

                if(item_el._reorder_listener) {
                    continue;
                }

                item_el._reorder_listener = true;

                // Track touch move before drag starts
                item_el.addEventListener('touchmove', function(e) {
                    if (meReorder.ip) {
                        e.preventDefault();
                        return;
                    }

                    if(!initialTouchY) {
                        return;
                    }

                    const touch = e.touches[0];
                    const moveDistance = Math.abs(touch.clientY - initialTouchY);

                    if (moveDistance > MOVE_THRESHOLD) {
                        hasMoved = true;
                        clearTimeout(touchTimeout);
                        initialTouchY = null;
                    }
                }, {
                    passive: false,
                });

                item_el.addEventListener('touchstart', function(e) {
                    if (!elHasClass(item_el, 'is-favorite')) return;

                    // Don't start drag if clicking the heart icon
                    const target = e.target;
                    if (target.closest('.heart') || target.closest('.remove')) {
                        return;
                    }

                    // Reset tracking variables
                    hasMoved = false;
                    initialTouchY = e.touches[0].clientY;

                    // Clear any existing timeout
                    clearTimeout(touchTimeout);

                    touchTimeout = setTimeout(function() {
                        if(!hasMoved) {
                            e.preventDefault();
                            e.stopPropagation();

                            const coords = getEventCoords(e);
                            meReorder.start.x = coords.x;
                            meReorder.start.y = coords.y;
                            meReorder.el = item_el;
                            meReorder.ip = true;
                            meReorder.dragStarted = false;

                            // Disable scrolling when drag starts
                            const scrollContainer = item_el.closest('.items-container');
                            if (scrollContainer) {
                                scrollContainer.style.overflow = 'hidden';
                            }

                            const idleItems = meReorder.getIdleItems(item_el.parentElement);
                            meReorder.setItemsGap(idleItems);
                            meReorder.initReorderItem(item_el);
                            meReorder.initItemsState(item_el, idleItems);
                        }
                    }, TOUCH_DELAY);
                });
            }
        },
        onSelectSecondary: function () {
            let secondaries = befriend.els.me.getElementsByClassName('secondary');

            for (let i = 0; i < secondaries.length; i++) {
                let secondary = secondaries[i];

                let options = secondary.getElementsByClassName('option');

                for (let i2 = 0; i2 < options.length; i2++) {
                    let option = options[i2];

                    if (!option._listener) {
                        option._listener = true;

                        option.addEventListener('click', async function (e) {
                            e.preventDefault();
                            e.stopPropagation();

                            let option_value = this.getAttribute('data-option');

                            let section = this.closest('.section');
                            let section_key = section.getAttribute('data-key');

                            let item_el = this.closest('.item');

                            let item_token = item_el.getAttribute('data-token');

                            let current_selected_el = secondary.querySelector('.current-selected');

                            //el
                            removeElsClass(options, 'selected');
                            addClassEl('selected', option);
                            befriend.me.transitionSecondary(secondary, false);
                            removeClassEl('unselected', secondary);
                            current_selected_el.innerHTML = option_value;

                            //data
                            let active_section = befriend.me.getActiveSection(section_key);

                            let item = active_section.items[item_token];

                            let prev_option_value = item.secondary;

                            if (prev_option_value !== option_value) {
                                item.secondary = option_value;

                                let table_key = item.table_key || befriend.me.getSectionTableKey(section_key);

                                //server
                                try {
                                    await befriend.auth.put(`/me/sections/item`, {
                                        section_key: section_key,
                                        table_key: table_key,
                                        section_item_id: item.id,
                                        secondary: option_value,
                                    });
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                        });
                    }
                }
            }
        },
        confirmAction: function () {
            let buttons = befriend.els.confirmMeAction.getElementsByClassName('button');

            for (let i = 0; i < buttons.length; i++) {
                let button = buttons[i];

                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    let action = button.getAttribute('data-action');

                    if (action === 'no') {
                        befriend.me.toggleConfirm(false);
                    } else if (action === 'yes') {
                        befriend.me.deleteSection(befriend.me.actions.delete.section);
                    }
                });
            }
        },
        onSelectAutoCompleteItem: function () {
            let els = befriend.els.me.querySelectorAll(`.autocomplete-list .item`);

            for (let i = 0; i < els.length; i++) {
                let el = els[i];

                if (el._listener) {
                    continue;
                }

                el._listener = true;

                el.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    let section = el.closest('.section');
                    let section_key = section.getAttribute('data-key');
                    let token = el.getAttribute('data-token');

                    befriend.me.toggleAutoComplete(null, false);

                    befriend.me.addSectionItem(section_key, token);

                    el.closest('.search-container').querySelector('.search-input').value = '';
                });
            }
        },
    },
};
