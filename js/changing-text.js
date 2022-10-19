(function(){
    var wordArray = [
        "Sendevo.",
        "Software.",
        "Sendevo.",
        "Simples.",
        "Sinérgicos.",
        "Sendevo.",
        "Soluciones."
    ];
    var speed = 100; // Velocidad de tipeo (ms)
    var pauseLength = 15; // Duracion de pausa (x speed)
    var wordIndex = 0; // Palabra actual
    var charIndex = 0; // Caracter actual
    var pauseCnt = 0; // Contador pause
    var status = "IDLE"; // Estado animacion

    function typeWrite() {
        var currentWord = wordArray[wordIndex];
        if (charIndex < currentWord.length) {
            document.getElementById("changing-title").innerHTML += currentWord.charAt(charIndex);
            charIndex++;
        }else{
            status = "IDLE";
        }
    }

    function clear() {
        document.getElementById("changing-title").innerHTML = "";
        var nextIndex = Math.floor(Math.random()*wordArray.length);
        while(nextIndex === wordIndex){
            nextIndex = Math.floor(Math.random()*wordArray.length);
        }
        wordIndex = nextIndex;
        charIndex = 0;
    }

    setInterval(function(){
        switch(status){
            case "IDLE":
                pauseCnt++;
                if(pauseCnt >= pauseLength){
                    pauseCnt = 0;
                    clear();
                    status = "WRITING";
                }
                break;
            case "WRITING":
                typeWrite();
                break;
            default:
                throw new Error("WRONG_STATUS");
        }
    }, speed);
})();
