befriend.html = {
    setEls: function () {
        befriend.els.views = document.getElementById("views");
        befriend.els.activities = document.getElementById("activities");
        befriend.els.change_location = document.getElementById("change-location");
        befriend.els.change_location_btn = document.getElementById("change-location-btn");
        befriend.els.num_persons = document.getElementById("num-persons");
        befriend.els.places = document.getElementById("places");
        befriend.els.when = document.getElementById("when");
        befriend.els.who = document.getElementById("who");
    },
    appInit: function () {
        return new Promise(async (resolve, reject) => {
            let html = `
            <div id="app">
                <div class="app-wrapper">
                    <div id="views">
                        <div class="view view-activities">
                            <div id="when" class="view-section">
                                <div class="section-title">When</div>
                                
                                <div class="when-options">
                                </div>
                            </div>
                            
                            <div id="who" class="view-section">
                                <div class="section-title">Friends</div>
                                
                                <div class="friend-options">
                                    <div class="friend-option active">
                                        <div class="name">New</div>
                                    </div>
                                    <div class="friend-option">
                                        <div class="name">Existing</div>
                                    </div>
                                    <div class="friend-option">
                                        <div class="name">Both</div>
                                    </div>
                                </div>
                                
                                <div id="num-persons">
                                    <div class="sub-section-title"># Persons</div>
                                        
                                    <div class="slider">
                                        <span>1</span>
                                        <input id="range-num-persons" class="range" type="range" value="1" min="1" max="10" step="1">
                                    </div>
                                </div>
                            </div>
                            
                            <div id="activities" class="view-section">
                                <div class="activities_container">
                                    <div class="section-title">Place</div>
                                    
                                    <div id="place-search-location">
                                        <div class="near">Near <span class="near-text">Me</span></div>
                                        <div id="change-location-btn" class="change">Change Location</div>
                                    </div>
                                    
                                                                    <div class="place-search">
                                        <div class="search">
                                            <div class="sub-section-title"></div>
                                            <input type="text" class="input-search-place" placeholder="Search for place">
                                        </div>
                                    </div>  
    
                                    
                                    <div id="activities-map-wrapper">
                                        <div id="activities-map"></div>
                                    </div>
                                    
                                    <div class="activities"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div id="places">
                        <svg class="back" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.001 351.9995"><path id="Left_Arrow" d="M400.001,159.9995H54.625L187.313,27.3115c6.252-6.252,6.252-16.376,0-22.624s-16.376-6.252-22.624,0L4.689,164.6875c-6.252,6.252-6.252,16.376,0,22.624l160,160c3.124,3.124,7.22,4.688,11.312,4.688s8.188-1.564,11.312-4.688c6.252-6.252,6.252-16.376,0-22.624L54.625,191.9995h345.376c8.836,0,16-7.164,16-16s-7.164-16-16-16Z"/></svg>
                        
                         <div class="no-places">No places found</div>
                         
                        <div class="places-wrapper">
                            <div class="header">
                                <div id="places-title" class="title"></div>
                                <div id="places-time"></div>
                            </div>
                            
                            <span class="spinner"></span>
                            
                            <div class="places">
                                
                            </div>
                        </div>
                    </div>
                    
                    <div id="change-location">
                        <svg class="back" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 416.001 351.9995"><path id="Left_Arrow" d="M400.001,159.9995H54.625L187.313,27.3115c6.252-6.252,6.252-16.376,0-22.624s-16.376-6.252-22.624,0L4.689,164.6875c-6.252,6.252-6.252,16.376,0,22.624l160,160c3.124,3.124,7.22,4.688,11.312,4.688s8.188-1.564,11.312-4.688c6.252-6.252,6.252-16.376,0-22.624L54.625,191.9995h345.376c8.836,0,16-7.164,16-16s-7.164-16-16-16Z"/></svg>
                        
                        <div class="wrapper">
                            <div class="header">
                                <div class="title">Change Location</div>
                            </div>
                            
                            <input type="text" class="input-text change-location-input" placeholder="Search location">
                            
                            <div class="suggestions">
                                
                            </div>
                            
                            <span class="spinner"></span>
                        </div>
                    </div>
                    
                    <div id="overlay"></div>
                    
                    <footer>
                        <div id="navigation">
                            <div class="navigation">
                                <div class="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224.1426 223.9168"><path d="M188.7505,67.8789c4.3057,0,9.0435.2249,13.7531-.0439,12.1212-.6919,22.0174,8.9796,21.6278,22.0336-.923,30.9298-23.8655,58.4054-54.3506,64.6021-1.1925.2424-2.5444,1.2148-3.2213,2.2427-6.2804,9.5367-13.7216,17.8024-24.1594,22.9439-5.7042,2.8098-11.7427,4.1536-18.0889,4.1555-12.8329.0038-25.6677-.1375-38.4982.0382-14.9345.2045-26.9764-5.6775-36.6198-16.8097-9.6746-11.1683-15.5226-24.3757-19.8247-38.3105-6.3024-20.414-9.7204-41.2811-9.4233-62.7146.0752-5.4216,2.5401-9.1432,6.9781-11.8531,5.8517-3.5731,12.3417-5.4968,18.9834-6.636,9.4279-1.617,18.9423-2.7317,28.4229-4.0388,1.8781-.2589,3.6877-.1733,4.9266,1.6053,1.8935,2.7185.0616,5.9211-3.5573,6.3437-6.8621.8015-13.8051,1.2355-20.5509,2.6193-7.5434,1.5475-14.9412,3.8621-22.3187,6.1169-1.6813.5139-3.0186,2.153-4.5143,3.2743,1.5158,1.1961,2.8716,2.7342,4.5743,3.5305,8.6212,4.032,17.933,5.5283,27.238,6.9033,22.3506,3.3027,44.7984,3.8279,67.3032,1.9939,14.2811-1.1638,28.5344-2.598,42.3859-6.5203,2.6187-.7416,5.2085-1.7969,7.5917-3.1074,3.2929-1.8107,3.3857-3.5077.0164-4.9261-5.4129-2.2786-11.0029-4.2481-16.6734-5.7691-4.8813-1.3093-9.9751-1.8372-14.9835-2.6584-3.3784-.5539-5.1714-3.0845-3.9321-5.749.7877-1.6934,2.2073-2.5544,4.0525-2.2832,11.0344,1.6222,22.1109,3.1267,32.4416,7.6794,3.4671,1.528,6.8087,3.5165,8.3681,7.1433,1.0496,2.4412,1.3373,5.2099,2.0527,8.1943ZM28.3121,74.2143c-.0195.4233-.0892.9818-.0645,1.536.7424,16.6954,3.1009,33.1419,7.8871,49.1795,3.5899,12.0292,8.3826,23.5128,16.2685,33.4653,8.3941,10.594,19.0304,17.1336,32.8317,17.3506,12.909.203,25.8242.1074,38.7358.0216,9.5692-.0636,17.8852-3.3963,24.8173-10.0628,8.9966-8.652,15.1331-19.1579,19.708-30.6367,5.9953-15.043,8.9957-30.7838,10.5423-46.8325.4527-4.6973.6551-9.4186.99-14.393-.8012.247-1.2532.391-1.708.526-6.8437,2.0309-13.5827,4.577-20.5513,5.9938-20.923,4.2538-42.1481,4.7395-63.4216,4.2126-17.1792-.4255-34.2734-1.6551-51.0308-5.6958-5.0497-1.2176-9.9457-3.0725-15.0043-4.6645ZM187.9632,75.9938c-1.0462,23.8766-4.8085,47.098-14.659,69.1954,3.7245-1.2678,7.3564-2.4989,10.6485-4.3384,20.5115-11.461,31.2011-29.0388,32.0634-52.5011.2329-6.3373-4.1555-11.8093-10.1206-12.2595-5.8613-.4424-11.7821-.0965-17.9323-.0965Z"/><path d="M101.2014,215.9811c25.0654.0354,47.1349-2.0247,68.5955-8.6022,8.6226-2.6427,16.995-5.9119,24.022-11.8268,1.202-1.0117,2.3162-2.1685,3.2933-3.3994,3.8324-4.8276,4.2557-10.1247.3704-14.8859-2.7399-3.3575-6.3629-6.0174-9.7175-8.839-1.3846-1.1646-3.1512-1.8623-4.6497-2.9076-1.7475-1.2191-2.1001-3.0147-1.2802-4.8724.8452-1.9149,2.7155-2.9882,4.5221-2.1259,9.5852,4.5757,18.3491,10.1906,21.1972,21.3747,1.7544,6.889-.3774,13.0054-4.9445,18.2956-5.1948,6.0173-11.9642,9.7415-19.1403,12.7932-13.2829,5.6487-27.2783,8.5437-41.5046,10.4331-20.7198,2.7518-41.5171,3.2295-62.3324,1.4376-19.3794-1.6683-38.5116-4.657-56.5202-12.5492-5.6674-2.4838-10.9919-5.565-15.4885-9.9075-9.9615-9.6203-10.1931-22.1341-.5066-32.0259,5.8277-5.9512,13.0872-9.6591,20.7088-12.7074,2.1537-.8614,4.4062.2391,5.1579,2.2281.7747,2.0498-.0865,4.011-2.2545,5.1828-4.2398,2.2916-8.6111,4.3789-12.6616,6.9678-2.5544,1.6327-4.8849,3.8-6.8609,6.1156-4.4755,5.2446-4.3176,11.0334.1169,16.3095,3.336,3.9691,7.6368,6.661,12.1974,8.9584,12.0234,6.0567,24.9486,9.1797,38.1105,11.39,13.9922,2.3497,28.1054,3.3575,39.5695,3.163Z"/><path d="M36.3072,180.2241c3.8371,2.1449,6.9738,4.1738,10.3316,5.7237,10.2228,4.7186,21.1157,7.0377,32.2159,8.4612,15.3498,1.9684,30.7352,2.0853,46.1207.5073,13.0551-1.339,25.8485-3.858,37.7999-9.5459,2.9478-1.4029,5.6621-3.2966,8.9366-5.2323-1.9003-1.3936-3.2229-2.3603-4.5419-3.3317-2.1838-1.6082-2.6703-3.8876-1.2508-5.8441,1.3245-1.8255,3.6481-2.1906,5.7503-.706,2.1028,1.485,4.2391,2.9849,6.0746,4.7722,3.0406,2.9607,3.0888,6.0609.284,9.2695-4.5818,5.2415-10.6987,8.1519-17.0087,10.5785-18.4642,7.1007-37.7744,9.0872-57.3757,9.0912-19.7929.004-39.2155-2.436-57.7919-9.5987-4.2994-1.6577-8.287-4.1892-12.271-6.5652-1.4428-.8605-2.6178-2.3242-3.6312-3.7189-2.211-3.0428-2.1728-6.449.4601-9.1045,2.0171-2.0344,4.4737-3.7003,6.9324-5.2077,1.8702-1.1466,4.1817-.3013,5.1736,1.5199,1.0715,1.9673.6501,3.737-1.0449,5.1247-1.4047,1.1501-2.9208,2.1641-5.1636,3.8068Z"/><path d="M87.8834,39.6694c.1954-3.8144.0296-7.6894.6579-11.431,1.5172-9.0345,9.2675-15.6906,18.3731-16.2256,3.0094-.1768,5.0316,1.3215,5.1449,3.8121.1087,2.3908-1.5159,3.8877-4.5403,4.1832-6.8908.6733-11.3777,5.534-11.4287,12.4459-.0398,5.4089.0897,10.8212-.0502,16.2269-.2697,10.4277-9.0021,19.1297-19.1841,19.2701-2.8049.0387-4.5765-1.3212-4.7591-3.6529-.1875-2.3947,1.5403-4.1004,4.4054-4.3492,7.0471-.6119,11.5049-5.4358,11.5608-12.5313.0203-2.5796.0033-5.1596.0033-7.7394-.061-.0029-.122-.0058-.183-.0088Z"/><path d="M116.8606,55.9521c-2.7804.0353-4.5685-1.3613-4.7341-3.6976-.1608-2.2686,1.57-4.028,4.2264-4.2965,7.4491-.7529,11.6871-5.4135,11.7107-12.906.0155-4.9139-.0277-9.8281.0105-14.7418.0834-10.7449,7.6209-19.0939,18.2439-20.2541,3.2089-.3504,5.3458.9561,5.7127,3.4444.2924,1.9831-1.4643,4.4318-4.7001,4.6165-6.7454.385-11.1926,5.5022-11.2413,12.2928-.0388,5.4134.0875,10.8299-.0506,16.2401-.2668,10.4498-9.002,19.173-19.1781,19.3021Z"/></svg>
                                </div>
                                <div class="name">Home</div>
                            </div>
                            
                            <div class="navigation">
                                <div class="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 255.2255 192.92"><g id="_x32_Ngy2g.tif"><path d="M102.352,108.9972c-24.2507-16.9062-24.2169-49.4846-6.7892-67.0464,17.0949-17.2264,44.557-17.4811,61.9913-.663,17.7338,17.107,18.7957,50.4602-5.9362,67.6185,3.7874,1.5094,7.6174,2.8054,11.248,4.5224,15.9544,7.5454,28.8335,18.416,36.4139,34.7163,3.3822,7.2728,4.974,14.9307,3.9223,23.0288-1.046,8.0541-5.3157,13.6248-12.6631,16.9023-7.1143,3.1734-14.7177,4.2575-22.3728,4.4109-17.0496.3418-34.1063.3997-51.1604.4282-10.4805.0175-20.9725.0122-31.4376-.4627-5.5243-.2507-11.1098-1.0946-16.4803-2.4259-16.2327-4.0238-20.3602-14.719-18.3838-28.8348,2.2804-16.2867,11.7425-28.2857,24.2768-38.1477,7.647-6.0166,16.2049-10.3942,25.4902-13.3338.55-.1741,1.081-.4079,1.8807-.7131ZM122.0788,111.9197c-3.9801,1.1848-7.4191,2.3059-10.9103,3.2299-11.6864,3.0932-22.7038,7.5787-32.1626,15.3137-9.979,8.1605-17.8783,17.8303-19.9185,30.9479-1.8626,11.9755.7137,18.2089,13.5484,20.8758,6.1515,1.2782,12.5152,2.1071,18.7872,2.1346,25.8737.1134,51.7529.0433,77.621-.4415,5.8678-.11,11.8111-1.7637,17.515-3.4139,5.2591-1.5216,8.0884-5.6603,8.5076-11.176.1628-2.1428.1522-4.3385-.1166-6.4676-1.3261-10.5035-6.5222-19.0676-13.7057-26.5547-10.1403-10.5688-22.683-16.9063-36.681-20.6755-4.1606-1.1203-8.2694-2.433-12.8178-3.7808,5.5662-3.7631,10.8077-7.0042,15.7177-10.687,11.4241-8.5689,16.5108-20.1005,14.2733-34.2399-2.22-14.0292-10.4765-23.6785-23.9314-28.0389-13.7654-4.4611-26.3163-1.3428-36.3809,9.124-9.9098,10.3058-12.3477,22.6883-7.8686,36.2542,2.5384,7.6882,7.5459,13.5835,14.286,18.0427,4.6208,3.0571,9.2032,6.1721,14.2371,9.5529Z"/><path d="M44.023,77.4298c-21.0601-20.9077-15.8011-54.8793,7.0157-69.8707,22.2281-14.6046,49.735-6.6048,61.8766,11.6858-2.1377,1.5041-4.2831,3.0137-6.5546,4.612-8.3255-10.7184-19.1206-16.2004-32.6829-15.4338-9.9112.5602-18.3297,4.6614-24.9265,12.0805-8.5552,9.6216-11.3285,20.865-8.4788,33.4005,2.8534,12.5516,11.4146,20.4909,22.958,26.7735-2.7359.8532-4.6391,1.5028-6.5735,2.0411-15.7642,4.3865-29.1705,12.4137-39.118,25.6155-5.7354,7.6116-9.2961,16.09-9.1886,25.8245.0928,8.4014,3.5966,13.9246,11.6534,16.3037,5.8383,1.724,12.0377,2.2353,18.0844,3.237,1.127.1867,2.2937.1343,3.6148.201v8.6218c-5.9197-.7187-11.5855-1.3272-17.2233-2.1319-2.121-.3027-4.2088-.9626-6.2576-1.6266-14.0818-4.5641-19.4338-15.1932-17.9959-28.9809,1.8303-17.55,11.4904-30.572,25.1243-40.8222,5.7952-4.3569,12.3661-7.6827,18.6725-11.5309Z"/><path d="M210.9825,77.9674c9.2173,3.8326,17.4475,8.7811,24.5991,15.3973,9.6298,8.9089,16.8757,19.3416,19.0494,32.5129.7706,4.6695.7905,9.6596.0685,14.3361-1.3563,8.7865-6.9916,14.4961-15.1244,17.7235-8.163,3.2393-16.7701,3.9273-25.7247,4.2351v-8.0817c4.187-.4405,8.4699-.8187,12.7303-1.37,2.1326-.276,4.2491-.7751,6.3303-1.3323,10.7491-2.878,15.6002-9.1929,13.9242-21.9708-1.828-13.937-9.8027-24.2582-20.3501-32.8792-8.99-7.3481-19.4252-11.7386-30.536-14.7107-.9385-.251-1.8619-.5581-3.3033-.9936,2.5371-1.7493,4.6829-3.2373,6.8373-4.7127,11.5597-7.9164,17.126-18.8768,16.7155-32.8732-.4885-16.6558-13.9504-31.9119-30.4675-34.3672-14.4569-2.1491-26.3415,2.5097-35.6045,13.8228-.261.3187-.5325.6288-.9756,1.1509-2.1677-1.516-4.3134-3.0167-6.7622-4.7293C151.1476,7.3801,162.6117.6811,177.0489.128c18.5989-.7126,33.2046,7.1459,41.93,23.5866,10.3592,19.5193,6.5836,37.6944-7.9964,54.2529Z"/></g></svg>
                                </div>
                                <div class="name">Friends</div>
                            </div>
                            
                            <div class="navigation">
                                <div class="icon">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 223.6843 212.8389"><defs><style>.cls-1{fill:#fff;}</style></defs><g id="Qtsbyc.tif"><path d="M35.2084,101.0415c1.4252-4.4618,3.6565-8.1906,7.179-11.0638,11.2194-9.1514,28.0765-4.8095,33.2944,8.6957.7396,1.9143,1.5922,2.4134,3.5341,2.4111,45.5125-.0557,91.0252-.0439,136.5378-.0384,1.0795.0001,2.1759-.0381,3.2353.1275,2.8232.4415,4.6821,2.6208,4.6518,5.3098-.0302,2.6854-1.9329,4.8107-4.7701,5.2134-.9812.1392-1.9917.0964-2.9888.0965-45.263.0041-90.526.0037-135.789.0039-1.0776,0-2.1552,0-3.3692,0-.2954.7105-.588,1.3682-.8452,2.0395-3.222,8.4099-11.1967,13.9534-20.0269,13.9151-8.7812-.0381-16.7209-5.4733-19.8152-13.806-.6375-1.7168-1.4342-2.2044-3.1788-2.1873-8.6524.0848-17.3061.0503-25.9592.0223-1.0698-.0034-2.1791-.0766-3.2001-.3649C1.4309,110.7754-.0199,108.6869.0027,106.3625c.0226-2.3314,1.4981-4.3714,3.8023-4.9685,1.1071-.2869,2.2992-.3351,3.4532-.3383,9.2313-.0254,18.4627-.0142,27.9502-.0142ZM45.3309,106.3265c-.0389,5.954,4.5544,10.6285,10.4829,10.6681,5.9611.0399,10.6305-4.5443,10.6715-10.4765.0411-5.9552-4.5506-10.6312-10.4795-10.672-5.9473-.0409-10.6363,4.5626-10.6749,10.4805Z"/><path d="M154.9009,186.2602c4.6623-11.0603,11.6466-16.2003,21.5215-15.9546,9.1363.2273,16.2412,5.8309,20.0428,15.9548,6.8967,0,13.8748-.0613,20.8502.051,1.419.0229,3.0346.3845,4.1946,1.1458,1.9777,1.2979,2.6314,3.4091,1.8577,5.719-.7966,2.3782-2.5338,3.6683-5.0708,3.6815-6.4057.0332-12.8129.0961-19.2165-.0188-1.9409-.0348-2.8262.4672-3.5485,2.4138-3.0898,8.3272-11.0367,13.6222-19.9046,13.586-8.7822-.0359-16.6246-5.2789-19.6824-13.5353-.7745-2.0912-1.8174-2.4551-3.768-2.4534-48.0856.0436-96.1713.0344-144.257.0323-.9979,0-2.0009.0305-2.9928-.0548-2.8038-.2413-4.8111-2.3196-4.9222-5.0285-.1128-2.7503,1.9322-5.1492,4.7473-5.4844.9035-.1076,1.8277-.0528,2.7424-.0529,48.1689-.0019,96.3378-.0016,144.5068-.0016h2.8995ZM165.1453,191.5587c-.0142,5.9,4.6816,10.6496,10.5448,10.6655,5.8719.016,10.5976-4.7038,10.6094-10.5961.0118-5.9066-4.6772-10.662-10.5398-10.6889-5.8461-.0269-10.6002,4.7296-10.6144,10.6195Z"/><path d="M161.8273,26.5783c-1.5206,4.829-4.0483,8.8368-8.086,11.8074-11.2192,8.2541-27.319,3.7174-32.3448-9.2707-.8174-2.1125-1.7996-2.5914-3.9161-2.5874-36.6832.0703-73.3665.0508-110.0498.0496-.8316,0-1.6692.0445-2.4938-.0361C2.0892,26.263-.0088,23.9778,0,21.2218c.009-2.7793,2.1012-4.9934,4.9921-5.2217.9927-.0784,1.995-.0441,2.9929-.0442,36.4337-.0017,72.8674-.0186,109.3009.0417,2.1575.0036,3.2919-.415,4.145-2.6755C124.5303,5.1104,132.4426-.046,141.2478.0003c8.7751.0461,16.5644,5.3092,19.6524,13.5742.7142,1.9116,1.5853,2.4358,3.5462,2.4265,17.1351-.0809,34.2708-.0471,51.4063-.0451.9148.0001,1.8332-.0276,2.7436.0407,2.909.2181,5.0012,2.382,5.0454,5.1695.0436,2.752-2.0404,5.0724-4.8779,5.3694-.8236.0862-1.6619.0413-2.4935.0414-17.2187.0018-34.4374.0013-51.656.0013h-2.787ZM141.0051,10.6145c-5.8113.0534-10.6354,4.9634-10.5545,10.7424.0813,5.8162,5.0005,10.6328,10.7713,10.5466,5.8495-.0874,10.5737-4.9199,10.5222-10.7633-.0514-5.8366-4.8905-10.5795-10.739-10.5257Z"/><path class="cls-1" d="M45.3309,106.3265c.0386-5.9179,4.7276-10.5214,10.6749-10.4805,5.9289.0408,10.5206,4.7169,10.4795,10.672-.0409,5.9322-4.7104,10.5164-10.6715,10.4765-5.9285-.0396-10.5218-4.7141-10.4829-10.6681Z"/><path class="cls-1" d="M165.1453,191.5587c.0142-5.8899,4.7684-10.6464,10.6144-10.6195,5.8626.0269,10.5516,4.7823,10.5398,10.6889-.0118,5.8923-4.7375,10.6121-10.6094,10.5961-5.8633-.0159-10.5591-4.7655-10.5448-10.6655Z"/><path class="cls-1" d="M141.0051,10.6145c5.8485-.0538,10.6876,4.6891,10.739,10.5257.0515,5.8434-4.6727,10.6759-10.5222,10.7633-5.7708.0862-10.69-4.7304-10.7713-10.5466-.0808-5.779,4.7433-10.689,10.5545-10.7424Z"/></g></svg>
                                </div>
                                <div class="name">Filters</div>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        `;

            document.body.insertAdjacentHTML("beforeend", html);

            befriend.html.setEls();

            resolve();
        });
    },
    setWhen: function () {
        return new Promise(async (resolve, reject) => {
            let html = "";

            for (let i = 0; i < befriend.when.options.length; i++) {
                let option = befriend.when.options[i];

                let name_html = ``;
                let tab_html = ``;

                if (option.is_now || option.is_schedule) {
                    name_html = option.name;
                } else {
                    tab_html = `<div class="value">${option.value}</div>
                                    <div class="unit">${option.unit}</div>`;
                }

                let time_class = "";

                let schedule_icon = "";

                if (option.is_now) {
                    time_class = "now";
                } else if (option.is_schedule) {
                    time_class = "schedule";
                    schedule_icon = `<svg id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 508 423.5801"><path d="M402.059,194.052V51.192c0-11.728-9.542-21.27-21.27-21.27h-16.23v-13.244c0-9.196-7.481-16.678-16.678-16.678h-16.076c-9.197,0-16.68,7.481-16.68,16.678v13.244h-43.109v-13.244C272.016,7.482,264.536,0,255.34,0h-16.078C230.066,0,222.584,7.481,222.584,16.678v13.244h-43.109v-13.244C179.475,7.482,171.994,0,162.797,0h-16.076C137.525,0,130.043,7.481,130.043,16.678v13.244h-43.109v-13.244C86.934,7.482,79.453,0,70.256,0h-16.076C44.983,0,37.5,7.481,37.5,16.678v13.244h-16.23C9.542,29.922,0,39.464,0,51.192v303.018c0,11.728,9.542,21.269,21.27,21.269h278.336c20.874,29.103,54.985,48.101,93.453,48.101,63.379,0,114.941-51.561,114.941-114.939,0-60.35-46.753-109.983-105.941-114.589h0ZM333.125,18h13.434v41.846h-13.434V18ZM240.584,18h13.432v41.846h-13.432V18ZM148.043,18h13.432v41.846h-13.432V18ZM55.5,18h13.434v41.846h-13.434V18ZM21.27,47.922h16.23v13.244c0,9.197,7.482,16.68,16.68,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h43.109v13.244c0,9.197,7.481,16.68,16.678,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h43.109v13.244c0,9.197,7.481,16.68,16.678,16.68h16.078c9.195,0,16.676-7.482,16.676-16.68v-13.244h43.109v13.244c0,9.197,7.482,16.68,16.68,16.68h16.076c9.196,0,16.678-7.482,16.678-16.68v-13.244h16.23c1.772,0,3.27,1.497,3.27,3.27v41.919H18v-41.919c0-1.773,1.497-3.27,3.27-3.27h0ZM21.27,357.479c-1.772,0-3.27-1.497-3.27-3.269V111.11h366.059v82.941c-59.188,4.606-105.939,54.24-105.939,114.589,0,17.454,3.918,34.007,10.908,48.838H21.27v.001ZM393.059,405.58c-53.453,0-96.939-43.486-96.939-96.938s43.486-96.94,96.939-96.94,96.941,43.487,96.941,96.94-43.487,96.938-96.941,96.938h0ZM96.723,278.202h-45.336c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.03-9-9-9ZM87.723,324.446h-27.336v-28.244h27.336v28.244ZM305.336,190.389h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9ZM314.336,144.145h27.338v28.244h-27.338v-28.244ZM266.023,202.173h-45.338c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.029-9-9-9h0ZM257.023,248.416h-27.338v-28.243h27.338v28.243ZM181.373,126.145h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9ZM172.373,172.389h-27.338v-28.244h27.338v28.244ZM266.023,278.202h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.029-9-9-9ZM257.023,324.446h-27.338v-28.244h27.338v28.244ZM266.023,126.145h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.029-9-9-9ZM257.023,172.389h-27.338v-28.244h27.338v28.244ZM181.373,202.173h-45.338c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.029-9-9-9ZM172.373,248.416h-27.338v-28.243h27.338v28.243ZM96.723,202.173h-45.336c-4.971,0-9,4.029-9,9v46.243c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.243c0-4.97-4.03-9-9-9ZM87.723,248.416h-27.336v-28.243h27.336v28.243ZM96.723,126.145h-45.336c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.336c4.971,0,9-4.03,9-9v-46.244c0-4.97-4.03-9-9-9ZM87.723,172.389h-27.336v-28.244h27.336v28.244ZM181.373,278.202h-45.338c-4.971,0-9,4.03-9,9v46.244c0,4.97,4.029,9,9,9h45.338c4.971,0,9-4.03,9-9v-46.244c0-4.971-4.029-9-9-9ZM172.373,324.446h-27.338v-28.244h27.338v28.244ZM410.478,298.585c2.485,4.305,1.011,9.809-3.294,12.294l-5.125,2.959v5.917c0,4.971-4.029,9-9,9-3.554,0-6.617-2.065-8.08-5.055l-34.99,20.202c-1.417.818-2.965,1.208-4.491,1.208-3.111,0-6.136-1.614-7.803-4.501-2.485-4.305-1.011-9.809,3.294-12.294l43.07-24.868v-72.763c0-4.971,4.029-9,9-9s9,4.029,9,9v63.433c3.322-.231,6.642,1.39,8.419,4.468h0Z"/></svg>`;
                } else {
                    time_class = "time";
                }

                let bc = befriend.when.colors[i];

                let font_white_class = useWhiteOnBackground(bc) ? "font_white" : "";

                let active_class = i === 0 ? "active" : "";

                html += `<div class="when-option ${time_class} ${active_class}" data-index="${i}">
                            <div class="tab ${font_white_class}" style="background-color: ${bc}">${tab_html}</div>

                            <div class="when-container">
                                <div class="name">${schedule_icon}${name_html}</div>
                                <div class="time"></div>
                            </div>
                         </div>`;
            }

            befriend.els.when.querySelector(".when-options").innerHTML = html;

            befriend.when.setWhenTimes();
            resolve();
        });
    },
    setActivityTypes: function () {
        return new Promise(async (resolve, reject) => {
            try {
                let activities = befriend.activities.types.data;

                let html = ``;
                let level_1_html = ``;

                //create rows and add hidden placeholder row below each row for multi-level select
                let activities_row = [];

                let level_1_ids = Object.keys(activities);

                for (let i = 0; i < level_1_ids.length; i++) {
                    let level_1_id = level_1_ids[i];

                    if (activities_row.length === befriend.variables.activity_row_items) {
                        let row_html = activities_row.join("");

                        level_1_html += `<div class="level_1_row">
                                            ${row_html}
                                        </div>`;
                        level_1_html += `<div class="level_2"></div>`;

                        activities_row.length = [];
                    }

                    let activity = activities[level_1_id];

                    let image_html = ``;

                    if (activity.image) {
                        image_html += `<div class="image">
                                        ${activity.image}
                                    </div>`;
                    } else if (activity.emoji) {
                        image_html += `<div class="emoji">
                                        ${activity.emoji}
                                    </div>`;
                    }

                    let icon_html = ``;

                    if (image_html) {
                        icon_html = `<div class="icon">${image_html}</div>`;
                    }

                    let center_class = icon_html ? "" : "center";

                    let bc = befriend.activities.types.colors[i];

                    let font_white_class = useWhiteOnBackground(bc) ? "font_white" : "";

                    activities_row.push(`
                        <div class="activity level_1_activity ${font_white_class}" data-id="${level_1_id}" style="background-color: ${bc}">
                            <div class="activity_wrapper ${center_class}">
                                ${icon_html}
                                <div class="name">${activity.name}</div>
                            </div>
                        </div>
                    `);
                }

                if (activities_row.length) {
                    let row_html = activities_row.join("");
                    level_1_html += `<div class="level_1_row">
                                            ${row_html}
                                        </div>`;
                    level_1_html += `<div class="level_2"></div>`;
                }

                html = `
                    <div class="level_1">${level_1_html}</div>
                `;

                befriend.els.activities.querySelector(".activities").innerHTML = html;

                let last_row = lastArrItem(befriend.els.activities.getElementsByClassName("level_1_row"));

                last_row.style.marginBottom = "0px";

                resolve();
            } catch (e) {
                console.error(e);
                return reject(e);
            }
        });
    },
    setPlaces: function () {
        return new Promise(async (resolve, reject) => {
            let html = "";

            for (let place of befriend.places.data.items) {
                let place_html = {
                    distance: ``,
                    location: ``,
                    price: ``,
                    rating: ``,
                    hours: ``,
                    full: ``,
                };

                //location
                if (place.location_address) {
                    place_html.location += `<div class="address">${place.location_address}</div>`;
                }

                if (place.location_address_2) {
                    //do not show if zip code in address_2

                    let is_postcode =
                        place.location_address_2.includes(place.location_postcode) ||
                        isZIPFormat(place.location_address_2);

                    if (!is_postcode) {
                        //do not show if address and address_2 are too similar
                        let str_similarity = stringSimilarity(place.location_address, place.location_address_2);

                        if (str_similarity < 0.5) {
                            place_html.location += `<div class="address_2">${place.location_address_2}</div>`;
                        }
                    }
                }

                place_html.location += `<div class="locality">${place.location_locality}, ${place.location_region}</div>`;

                //distance
                place_html.distance = place.distance.miles_km.toFixed(1);

                if (place.distance.miles_km < 1) {
                    //hide trailing zero if less than 1 m/km
                    place_html.distance = parseFloat(place.distance.miles_km.toFixed(1));
                }

                if (parseFloat(place_html.distance) % 1 === 0) {
                    //add decimal if rounded exactly to integer
                    place_html.distance = parseFloat(place_html.distance).toFixed(1);
                }

                if (place.distance.use_km) {
                    //km
                    if (place.distance.miles_km < 0.1) {
                        //meters
                        place_html.distance = place.distance.meters;
                        place_html.distance += " meters";
                    } else {
                        place_html.distance += " km";
                    }
                } else {
                    //miles
                    if (place.distance.miles_km < 0.1) {
                        //feet
                        place_html.distance = metersToFeet(place.distance.meters);
                        place_html.distance += " ft";
                    } else {
                        place_html.distance += " m";
                    }
                }

                //price
                if (place.price) {
                    let price_str = "";

                    for (let i = 0; i < place.price; i++) {
                        price_str += "$";
                    }

                    place_html.price += `<div class="price">${price_str}</div>`;
                }

                //rating
                if (isNumeric(place.rating)) {
                    let rating_str = place.rating.toFixed(1);
                    let rating = parseFloat(rating_str);

                    let stars_html = ``;

                    let color = befriend.variables.brand_color_a;

                    for (let i = 1; i <= 5; i++) {
                        let percent;

                        if (rating > i) {
                            percent = 100;
                        } else {
                            let diff = i - rating;

                            if (diff > 1) {
                                percent = 0;
                            } else {
                                percent = (1 - diff) * 100;
                            }
                        }

                        let percent_str = percent + "%";

                        let star_html = `<div class="circle-container">
                                                <div class="fill" style="background: linear-gradient(to right, ${color} ${percent_str}, transparent ${percent_str});"></div>
                                            </div>`;

                        stars_html += star_html;
                    }

                    place_html.rating += `<div class="rating">
                                                <div class="stars">${stars_html}</div>
                                                <div class="num">${rating_str}</div>
                                          </div>`;
                } else {
                    place_html.rating += `<div class="rating">
                                                <div class="no-rating">No Rating</div>
                                          </div>`;
                }

                //todo
                //reality
                let reality_html = ``;

                //closed

                place_html.full = `<div class="left-col">
                        <div class="distance-price">
                            <div class="distance">${place_html.distance}</div>
                            ${place_html.price}
                        </div>
                            
                        <div class="name-price">
                            <div class="name">${place.name}</div>
                        </div>
                        
                         <div class="rating-price">
                             ${place_html.rating}
                         </div>
    
                         <div class="location">
                             <div class="location-address">
                                ${place_html.location}
                             </div>
                         </div>
                    </div>
                                    
                    <div class="right-col">
                        <div class="hours"></div>
                        <div class="button">Select</div>
                    </div>`;

                html += `<div class="place" data-place-id="${place.id}">${place_html.full}</div>`;
            }

            befriend.els.places.querySelector(".places").innerHTML = html;

            befriend.html.setPlacesHours();

            resolve();
        });
    },
    setPlacesHours: function () {
        //header
        befriend.places.setPlacesTime();

        let places_els = befriend.els.places.getElementsByClassName("place");

        for (let i = 0; i < places_els.length; i++) {
            let el = places_els[i];

            let hours_el = el.querySelector(".hours");

            removeClassEl("show", hours_el);
            removeClassEl("open", hours_el);
            removeClassEl("closed", hours_el);

            let id = el.getAttribute("data-place-id");

            let place_data = befriend.places.data.obj[id];

            if (!place_data) {
                console.error("No place data");
                continue;
            }

            if (place_data.is_open === null) {
                continue;
            }

            addClassEl("show", hours_el);

            if (place_data.is_open) {
                hours_el.innerHTML = `<div class="status">Open</div>`;

                addClassEl("open", hours_el);
            } else {
                hours_el.innerHTML = `<div class="status">Closed</div>`;

                addClassEl("closed", hours_el);
            }
        }
    },
};
