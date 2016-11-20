var express = require('express')
var bodyParser = require('body-parser')
var request = require('request')
var app = express()

app.use(bodyParser.json())
app.set('port', (process.env.PORT || 4000))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get('/webhook', function(req, res) {
  var key = 'EAAED8JoP8T8BAMweGCz05n2xCGzw6k8ZBP3JKZCskZBxZCbYOUzOXNkZCZCZChZAF2QDXalqVg3c0OjtH4i4bTux0jAAMqUQt0Bmoy7c72eR2poIZAUwfrXXN4whWszZAkIL8ihBlFoRRXOMEpT3I6NU7HXHtvH65jJRqaTo70EsdvgQZDZD'
  if (req.query['hub.mode'] === 'subscribe' &&
    req.query['hub.verify_token'] === key) {
    console.log("Validating webhook");
    res.send(req.query['hub.challenge'])
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);          
  }  
});

app.post('/webhook', function (req, res) {
  var data = req.body;

  // Make sure this is a page subscription
  if (data.object == 'page') {
    // Iterate over each entry
    // There may be multiple if batched
    data.entry.forEach(function(pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;

      // Iterate over each messaging event
      pageEntry.messaging.forEach(function(messagingEvent) {
        if (messagingEvent.message) {
          receivedMessage(messagingEvent);
        } else if (messagingEvent.postback) {
          receivedPostback(messagingEvent);
        } else {
          console.log("Webhook received unknown messagingEvent: ", messagingEvent);
        }
      });
    });

    // Assume all went well.
    //
    // You must send back a 200, within 20 seconds, to let us know you've 
    // successfully received the callback. Otherwise, the request will time out.
    res.sendStatus(200);
  }
});

function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message;

  console.log("Received message for user %d and page %d at %d with message:", 
    senderID, recipientID, timeOfMessage);
  console.log(JSON.stringify(message));

  var isEcho = message.is_echo;
  var messageId = message.mid;
  var appId = message.app_id;
  var metadata = message.metadata;
 
  // You may get a text or attachment but not both
  var messageText = message.text;
  var messageAttachments = message.attachments;
  var quickReply = message.quick_reply;

 /* if (isEcho) {
    // Just logging message echoes to console
    console.log("Received echo for message %s and app %d with metadata %s", 
      messageId, appId, metadata);
    return;
  } else if (quickReply) {
    var quickReplyPayload = quickReply.payload;
    console.log("Quick reply for message %s with payload %s",
      messageId, quickReplyPayload);

    sendTextMessage(senderID, "Quick reply tapped");
    return;
  }*/
  if (messageText) {
    if (messageText == 'ค้นหาร้านอาหาร') {
      setTimeout(function() {
        sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
      }, 1000)
      setTimeout(function() {
        findRestaurants(senderID);
      }, 1500)
    }
    else if (messageText == 'ไม่เป็นไร ขอบคุณ') {
      setTimeout(function() {
        sendTextMessage(senderID, ":(");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
      }, 1000)
      setTimeout(function() {
        needYourHelp(senderID);
      }, 1500) 
    }
    else if (messageText == 'ต้องการให้คุณช่วย') {
      setTimeout(function() {
        sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
      }, 500)
      setTimeout(function() {
        sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
      }, 1000)
      setTimeout(function() {
        findRestaurants(senderID);
      }, 1500)
    } else {}

    // If we receive a text message, check to see if it matches a keyword
    // and send back the example. Otherwise, just echo the text we received.
    switch (messageText) {
      case '':
        sendGreetMessage(senderID);
        break;
      /*case 'quick reply':
        sendQuickReply(senderID);
        break;
      default:
        sendTextMessage(senderID, messageText);*/
    }
  } 
  else if (messageAttachments) {
    sendTextMessage(senderID, "Message with attachment received");
  }
}

function receivedPostback(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfPostback = event.timestamp;

  // The 'payload' param is a developer-defined field which is set in a postback 
  // button for Structured Messages. 
  var payload = event.postback.payload;
  
  console.log("Received postback for user %d and page %d with payload '%s' " + 
    "at %d", senderID, recipientID, payload, timeOfPostback);
  
  if(payload == 'getStart'){
       sendTextMessage(senderID, "สวัสดีครับ :)");
       sendGreetMessage(senderID);
  }
  ///////////////////////////////////////////////////////////////////
  else if(payload == 'findRestaurant' || payload == 'I_need_your_help'){
    setTimeout(function() {
      sendTextMessage(senderID, "นี้คือร้านอาหารยอดนิยมในปราจีนบุรี");
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "คุณต้องการรับประทานอาหารในสถานที่ใดครับ 🏠");
    }, 1000)
    setTimeout(function() {
      findRestaurants(senderID);
    }, 1500)
  }
  else if(payload == 'noThank'){
    setTimeout(function() {
      sendTextMessage(senderID, ":(");
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "แน่ใจนะครับ! คุณจะไม่หิวตอนนี้ใช่มั้ย");
    }, 1000)
    setTimeout(function() {
      needYourHelp(senderID);
    }, 1500)
  } 
  //////////////////////////////////////////////////////////////////
  else if(payload == 'robinson'||payload == 'baannernnam'||payload == 'ChomChol'||payload == 'Add'||payload == 'PalmSweetHome'||payload == 'NamHiang'||payload == 'CafeKantary'){
    setTimeout(function() {
      if(payload == 'robinson'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่โรบินสัน ปราจีนบุรี");}
      if(payload == 'baannernnam'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่สวนอาหาร บ้านเนินน้ำ");}
      if(payload == 'ChomChol'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านอาหารชมชล");}
      if(payload == 'Add'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านแอ๊ด ข้าวต้ม กบินทร์บุรี");}
      if(payload == 'PalmSweetHome'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านอาหาร ปาล์มสวีทโฮม กบินทร์บุรี ปราจีนบุรี");}
      if(payload == 'NamHiang'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่มีหลากหลายเมนูที่ร้านน่ำเฮียง โภชนา (ฟ้ามุ่ย) ร้านอร่อยที่กบินทร์บุรี");}
      if(payload == 'CafeKantary'){sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบกับเบเกอรี่แสนอร่อยที่ร้าน Cafe Kantary ");}
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "คุณชอบรับประทานอาหารประเภทไหนครับ");
    }, 1000)
    setTimeout(function() {
       if(payload == 'robinson'){menuFoodRobinson(senderID);}
      else if(payload == 'baannernnam'){menuFoodBaannernnam(senderID);}
      else if(payload == 'ChomChol'){menuFoodChomChol(senderID);}
      else if(payload == 'Add'){menuFoodAdd(senderID);}
      else if(payload == 'PalmSweetHome'){menuFoodPalmSweetHome(senderID);}
      else if(payload == 'NamHiang'){menuFoodNamHiang(senderID);}
      else if(payload == 'CafeKantary'){menuFoodCafeKantary(senderID);}
      else{var result = "";}
    }, 1500)
  }
  //////////////////////////////////////////////////////////////////
  else if(payload == 'everyWhere'){
    setTimeout(function() {
      sendTextMessage(senderID, "แน่นอนครับ! คุณจะพบร้านอาหารที่ปราจีนบุรี");
    }, 500)
    setTimeout(function() {
      sendTextMessage(senderID, "คุณชอบรับประทานอาหารประเภทไหนครับ");
    }, 1000)
    setTimeout(function() {
       //sendTextMessage(senderID, "คุdsdsdsdบ");
      everyWhere(senderID);
    }, 1500)
  }else {
    var result = "";
  }
}

//ทุกที่ในปาจีน
function everyWhere(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Topokki",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/09/12/e18408e67b634f9d945f7382b27121a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatSalang"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataSalang"
              }]
           },
           {
             title:"Wagyu Steak",
             item_url:"",
             image_url:"http://oknation.nationtv.tv/blog/home/user_data/file_data/201301/15/14980c201.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatJefferSteak"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataJefferSteak"
               }]
            },
          {
             title:"ํTakoyaki",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/96BE41CD-F01D-4E9B-85D1-6AB8B84A4C02.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatYayoi"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataYayoi"
               }]
            },
        {
             title:"ํHot Pot Buffet",
             item_url:"",
             image_url:"http://2.bp.blogspot.com/-rtL6WPiASvM/Vn6w4mfVHuI/AAAAAAAABlI/6ygYNRreW4Q/s1600/%25E0%25B8%25AA%25E0%25B8%25A1%25E0%25B8%25B1%25E0%25B8%2584%25E0%25B8%25A3%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%2BPart%2BTime%2BHOT%2BPOT%2B%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%258B%25E0%25B9%2587%25E0%25B8%25A5%25E0%25B8%2597%25E0%25B8%25A3%25E0%25B8%25B1%25E0%25B8%25A5%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2587%25E0%25B8%2599%25E0%25B8%25B2%2B45%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2597%25E0%25B8%258A%25E0%25B8%25A1..jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatHotPot"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataHotPot"
               }]
            },
        {
             title:"ํTempura Somen",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/F5D45267-6E7A-46B2-81D2-81F2F96C1C23.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatTempura"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataTempura"
               }]
            },
        {
             title:"ํRamen Champion",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/8D6E1B28-3E20-4865-86D0-493F1254C795.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatRamenChampion"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataRamenChampion"
               }]
            },
        {
            title:"ฮันนี่ โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/HT_choco_whitebig.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatCafeFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataCafeFirst"
              }]
           },
           {
             title:"เบอร์รี่ เบอร์รี่ เครป",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/crepe1_B.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeSecond"
               }]
            },
          {
             title:"ํคาราเมล วาฟเฟิล ",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w2_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeThird"
               }]
            },
        {
             title:"ํสตรอเบอร์รี่ วาฟเฟิล",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w1_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFourth"
               }]
            },
        {
             title:"ํโอ้ ล้า ลา ฮันนี่ โทสต์",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/cake-update.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFifth"
               }]
            },
        {
             title:"ํไอศครีมโฮมเมด",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/gelato.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFifth"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 


//เมนูร้านcafe kantary
function menuFoodCafeKantary(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ฮันนี่ โทสต์",
            item_url:"",
            image_url:"http://www.cafekantary.com/images/example/HT_choco_whitebig.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatCafeFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataCafeFirst"
              }]
           },
           {
             title:"เบอร์รี่ เบอร์รี่ เครป",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/crepe1_B.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeSecond"
               }]
            },
          {
             title:"ํคาราเมล วาฟเฟิล ",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w2_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeThird"
               }]
            },
        {
             title:"ํสตรอเบอร์รี่ วาฟเฟิล",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/example/w1_b.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFourth"
               }]
            },
        {
             title:"ํโอ้ ล้า ลา ฮันนี่ โทสต์",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/cake-update.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFifth"
               }]
            },
        {
             title:"ํไอศครีมโฮมเมด",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/gelato.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatCafeFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataCafeFifth"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านน่ำเฮียง
function menuFoodNamHiang(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระดูกหมูอ่อนทอดกระเทียมพริกไทย",
            item_url:"",
            image_url:"http://i0.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/NumHiang_004.jpg?resize=1024%2C769",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatNamHiangFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataNamHiangFirst"
              }]
           },
           {
             title:"ผัดผักกระเฉดชลูดน้ำ",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataNamHiangSecond"
               }]
            },
          {
             title:"ํทอดมันกุ้ง ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_006.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataNamHiangThird"
               }]
            },
        {
             title:"ํมะระผัดไข่",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataNamHiangFourth"
               }]
            },
        {
             title:"ํต้มยำไก่บ้าน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_008.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataNamHiangFifth"
               }]
            },
        {
             title:"ํปลาซิวทอดกรอบ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_009.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatNamHiangFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataNamHiangFifth"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านปาล์มสวีทโฮม
function menuFoodPalmSweetHome(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ไก่มะนาว",
            item_url:"",
            image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_003.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatPalmFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataPalmFirst"
              }]
           },
           {
             title:"ผักบุ้งไฟแดง",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_001.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPalmSecond"
               }]
            },
          {
             title:"ํยำกระเฉดชลูดน้ำ",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_004.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPalmThird"
               }]
            },
        {
             title:"ํผัดเผ็ดหมูป่า",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPalmFourth"
               }]
            },
        {
             title:"ํแกงส้มแป๊ะซะ",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPalmFifth"
               }]
            },
        {
             title:"ํผัดเผ็ดปลาช่อน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/PalmSweetHome_002.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPalmFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPalmFifth"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูร้านแอ๊ดข้าวต้ม
function menuFoodAdd(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"กระเฉดชลูดน้ำไฟแดง",
            item_url:"",
            image_url:"http://i2.wp.com/s3-ap-southeast-1.amazonaws.com/ungsriwong/wp-content/uploads/2014/05/AddKabin_004.jpg?resize=1024%2C768",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatAddFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataAddFirst"
              }]
           },
           {
             title:"ผักบุ้งไฟแดง",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_005.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddSecond"
               }]
            },
          {
             title:"ํหมูผัดหนำเลี๊ยบ",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_007.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddThird"
               }]
            },
        {
             title:"ํแกงป่า ปลาเห็ดโคน",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_008.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddFourth"
               }]
            },
        {
             title:"ํเกี้ยมฉ่ายกระเพาะหมู",
             item_url:"",
             image_url:"http://i2.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_010.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddFifth"
               }]
            },
        {
             title:"ํปลาสลิดทอด",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_009.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddFifth"
               }]
        },
        {
             title:"ํข้าวต้ม",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_006.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatAddFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataAddFifth"
               }]
        }]
      }
    }
  }
};
callSendAPI(messageData);
} 


//เมนูร้านชลมล
function menuFoodChomChol(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"ส้มตำปูม้า",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/01/03/82eeb8edf2404be0b4c96b2d81d809a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatChomCholFirst"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataChomCholFirst"
              }]
           },
           {
             title:"ลาบปลาช่อนทอด",
             item_url:"",
             image_url:"http://lenoircafe.net/wp-content/uploads/2013/03/%E0%B8%A5%E0%B8%B2%E0%B8%9A%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%8A%E0%B9%88%E0%B8%AD%E0%B8%993-650.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholSecond"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataChomCholSecond"
               }]
            },
          {
             title:"ํทอดมันปลากราย",
             item_url:"",
             image_url:"http://archeep.smeleader.com/wp-content/uploads/2014/11/%E0%B8%97%E0%B8%AD%E0%B8%94%E0%B8%A1%E0%B8%B1%E0%B8%99%E0%B8%9B%E0%B8%A5%E0%B8%B2%E0%B8%81%E0%B8%A3%E0%B8%B2%E0%B8%A202-Medium.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholThird"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataChomCholThird"
               }]
            },
        {
             title:"ํต้มยำกุ้งน้ำข้น ",
             item_url:"",
             image_url:"http://food.mthai.com/app/uploads/2014/04/184615110-1.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholFourth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataChomCholFourth"
               }]
            },
        {
             title:"ํปลาเนื้ออ่อนทอดกระเทียม",
             item_url:"",
             image_url:"http://f.ptcdn.info/922/041/000/o5vl43d99sVRvnpZsgm-o.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatChomCholFifth"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataChomCholFifth"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูสวนอาหาร บ้านเนินน้ำ
function menuFoodBaannernnam(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"คอหมูย่าง",
            item_url:"",
            image_url:"https://3.bp.blogspot.com/-AOL0RYCwIFg/Vv8-bEVDvwI/AAAAAAAADCw/bgeu32RDx1UoxImeH-zAU0z5IYz4nAicg/s1600/12670891_953230498124388_7147210296053861375_n.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatGrilledPork"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataGrilledPork"
              }]
           },
           {
             title:"ขาหมูทอดกรอบ",
             item_url:"",
             image_url:"http://img.painaidii.com/images/20120930_127_1349021565_291754.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatPigFried"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPigFried"
               }]
            },
          {
             title:"ํเป็ดทรงเครื่อง",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2014/08/29/a52128d66bb24e7080839cda4f45a36f.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatDuck"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataDuck"
               }]
            },
        {
             title:"ํยำปลาหมึก",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2016/06/11/bfed5f221ced417e9994156960471aaa.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatSquid"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataSquid"
               }]
            },
        {
             title:"ํผัดเผ็ดหมูป่า",
             item_url:"",
             image_url:"http://www.kidtam.com/wp-content/uploads/2016/09/12-3.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatPigSpicy"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataPigSpicy"
               }]
            },
        {
             title:"ํต้มยำกุ้งเล็ก",
             item_url:"",
             image_url:"http://www.doodiza.com/images/1605_1447997622.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatTomyumkung"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataTomyumkung"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//เมนูโรบินสัน
function menuFoodRobinson(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"Topokki",
            item_url:"",
            image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/09/12/e18408e67b634f9d945f7382b27121a7.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ ต้องการทานสิ่งนี้",
                payload:"eatSalang"
              },
              {
                type:"postback",
                title:"🔔 ข้อมูลอาหาร",
                payload:"dataSalang"
              }]
           },
           {
             title:"Wagyu Steak",
             item_url:"",
             image_url:"http://oknation.nationtv.tv/blog/home/user_data/file_data/201301/15/14980c201.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅ ต้องการทานสิ่งนี้",
                 payload:"eatJefferSteak"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataJefferSteak"
               }]
            },
          {
             title:"ํTakoyaki",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/96BE41CD-F01D-4E9B-85D1-6AB8B84A4C02.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatYayoi"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataYayoi"
               }]
            },
        {
             title:"ํHot Pot Buffet",
             item_url:"",
             image_url:"http://2.bp.blogspot.com/-rtL6WPiASvM/Vn6w4mfVHuI/AAAAAAAABlI/6ygYNRreW4Q/s1600/%25E0%25B8%25AA%25E0%25B8%25A1%25E0%25B8%25B1%25E0%25B8%2584%25E0%25B8%25A3%25E0%25B8%2587%25E0%25B8%25B2%25E0%25B8%2599%2BPart%2BTime%2BHOT%2BPOT%2B%25E0%25B8%25AA%25E0%25B8%25B2%25E0%25B8%2582%25E0%25B8%25B2%25E0%25B9%2580%25E0%25B8%258B%25E0%25B9%2587%25E0%25B8%25A5%25E0%25B8%2597%25E0%25B8%25A3%25E0%25B8%25B1%25E0%25B8%25A5%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2587%25E0%25B8%2599%25E0%25B8%25B2%2B45%25E0%25B8%259A%25E0%25B8%25B2%25E0%25B8%2597%25E0%25B8%258A%25E0%25B8%25A1..jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatHotPot"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataHotPot"
               }]
            },
        {
             title:"ํTempura Somen",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/F5D45267-6E7A-46B2-81D2-81F2F96C1C23.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatTempura"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataTempura"
               }]
            },
        {
             title:"ํRamen Champion",
             item_url:"",
             image_url:"https://www.yayoirestaurants.com/uploads/image/8D6E1B28-3E20-4865-86D0-493F1254C795.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ ต้องการทานสิ่งนี้",
                 payload:"eatRamenChampion"
               },
               {
                 type:"postback",
                 title:"🔔 ข้อมูลอาหาร",
                 payload:"dataRamenChampion"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

//ต้องการให้คุณช่วย
function needYourHelp(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "หากคุณต้องการมองหาร้านอาหารในปราจีนบุรีอีก เพียงแค่ให้ผมช่วย",
            buttons: [{
              type: "postback",
              title: "⚡️ ต้องการให้คุณช่วย",
              payload: "I_need_your_help"
            }]
        }
      }
    }
  };
  callSendAPI(messageData);
}

function sendGreetMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text : "นี้คือคู่มือร้านอาหารของคุณในปราจีนบุรี ผมจะช่วยคุณได้อย่างไร",
            buttons: [{
              type: "postback",
              title: "🍣 ค้นหาร้านอาหาร",
              payload: "findRestaurant"
            }, {
              type: "postback",
              title: "❌ ไม่เป็นไร ขอบคุณ",
              payload: "noThank"
            }]
        }
      }
    }
  };  

  callSendAPI(messageData);
}

function findRestaurants(recipientId, messageText) {
  var messageData = {
  recipient: {
    id : recipientId
  },
  message:{
    attachment:{
      type:"template",
      payload:{
        template_type:"generic",
        elements:[
          {
            title:"โรบินสัน ปราจีนบุรี",
            item_url:"",
            image_url:"http://www.robinson.co.th/images/201412/gallery2/1-1.jpg",
            subtitle:"",
            buttons:[
              {
                type:"postback",
                title:"✅ เลือกที่นี้",
                payload:"robinson"
              },
              {
                type:"postback",
                title:"🔔 ทุกที่ในปราจีนบุรี",
                payload:"everyWhere"
              }]
           },
           {
             title:"Cafe Kantary",
             item_url:"",
             image_url:"http://www.cafekantary.com/images/gallery/pra3.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:" ✅เลือกที่นี้",
                 payload:"CafeKantary"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"สวนอาหาร บ้านเนินน้ำ",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2015/06/01/768c556759d446499cd21aa9896957f8.jpg?v=2",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"baannernnam"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"ร้านอาหารชมชล",
             item_url:"",
             image_url:"https://s3-ap-southeast-1.amazonaws.com/photo.wongnai.com/photos/2012/10/07/0e81bf6ad4ef4f2ea4361c7985c027df.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"ChomChol"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"น่ำเฮียงโภชนา (ฟ้ามุ่ย)",
             item_url:"",
             image_url:"http://i0.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/NumHiang_010.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"NamHiang"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"แอ๊ด ข้าวต้ม กบินทร์บุรี",
             item_url:"",
             image_url:"http://i1.wp.com/ungsriwong.s3.amazonaws.com/wp-content/uploads/2014/05/AddKabin_012.jpg",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"Add"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            },
        {
             title:"ร้านอาหาร ปาล์มสวีทโฮม กบินทร์บุรี",
             item_url:"",
             image_url:"http://image.free.in.th/v/2013/iq/161118060914.png",
             subtitle:"",
             buttons:[
               {
                 type:"postback",
                 title:"✅ เลือกที่นี้",
                 payload:"PalmSweetHome"
               },
               {
                 type:"postback",
                 title:"🔔 ทุกที่ในปราจีนบุรี",
                 payload:"everyWhere"
               }]
            }]
      }
    }
  }
};
callSendAPI(messageData);
} 

function sendTextMessage(recipientId, messageText) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText
    }
  };

  callSendAPI(messageData);
}

function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: 'EAAED8JoP8T8BAMweGCz05n2xCGzw6k8ZBP3JKZCskZBxZCbYOUzOXNkZCZCZChZAF2QDXalqVg3c0OjtH4i4bTux0jAAMqUQt0Bmoy7c72eR2poIZAUwfrXXN4whWszZAkIL8ihBlFoRRXOMEpT3I6NU7HXHtvH65jJRqaTo70EsdvgQZDZD' },
    method: 'POST',
    json: messageData

  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;

      console.log("Successfully sent generic message with id %s to recipient %s", 
        messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });  
}

/*function sendQuickReply(recipientId) {
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: "What's your favorite movie genre?",
      quick_replies: [
        {
          "content_type":"text",
          "title":"Action",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_ACTION"
        },
        {
          "content_type":"text",
          "title":"Comedy",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_COMEDY"
        },
        {
          "content_type":"text",
          "title":"Drama",
          "payload":"DEVELOPER_DEFINED_PAYLOAD_FOR_PICKING_DRAMA"
        }
      ]
    }
  };
  callSendAPI(messageData);
}*/

app.listen(app.get('port'), function () {
  console.log('run at port', app.get('port'))
})
