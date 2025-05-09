const mailingApp = firebase.initializeApp({
    apiKey: "AIzaSyAzPXh2y3txdmjnuX695g_l1uNCutdMaMU",
    authDomain: "sendevo-mailing.firebaseapp.com",
    databaseURL: "https://sendevo-mailing-default-rtdb.firebaseio.com",
    projectId: "sendevo-mailing",
    storageBucket: "sendevo-mailing.appspot.com",
    messagingSenderId: "602162181087",
    appId: "1:602162181087:web:ac3f237c8243765e83ca6a"
});

function resultMessage(data) {
    const messageAlert = `alert-${data.type}`;
    const messageText = data.message;
    const alertBox = `<div class="alert ${messageAlert} alert-dismissable">
                        <button type="button" class="close" data-dismiss="alert" aria-hidden="true">
                            &times;
                        </button>
                        ${messageText}
                    </div>`;
    if (messageAlert && messageText) {
        $("#contact-form").find('.messages').html(alertBox);
        $("#contact-form")[0].reset();
    }
}

$("#contact-form").submit(function(e) {    
    e.preventDefault();
    const formData = $(this).serializeArray();    
    if(formData.length > 0 && formData.every(el => el.value !== "")){
        const formObject = formData.reduce((a,b) => ({...a, [b.name]: b.value}), {});
        formObject["date"] = new Date().toISOString();
        //console.log(formObject);
        const database = firebase.database();
        database.ref("sendevo_messages")
        .push(formObject)
        .then(res => {
            resultMessage({type:"success", message:"Gracias por su mensaje. Le responderemos a la brevedad"});
        })
        .catch(console.warn);
        
    }else{
        resultMessage({type:"danger", message:"Debe completar todos los campos"})
    }
});
