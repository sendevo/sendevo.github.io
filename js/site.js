(function () {
    "use strict";

    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Header: fondo al desplazar + menú móvil
    var header = document.getElementById("header");
    var toggle = header.querySelector(".nav-toggle");
    var navLinks = header.querySelectorAll(".main-nav a");

    function onScroll() {
        header.classList.toggle("is-scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
        header.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
    }
    toggle.addEventListener("click", function () {
        setMenu(!header.classList.contains("is-open"));
    });
    navLinks.forEach(function (link) {
        link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") setMenu(false);
    });

    // Enlace activo según la sección visible
    var sectionLinks = {};
    navLinks.forEach(function (link) {
        var id = link.getAttribute("href");
        if (id.charAt(0) === "#") sectionLinks[id.slice(1)] = link;
    });
    if ("IntersectionObserver" in window) {
        var sectionObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (l) { l.classList.remove("is-active"); });
                var link = sectionLinks[entry.target.id];
                if (link) link.classList.add("is-active");
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        Object.keys(sectionLinks).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) sectionObserver.observe(el);
        });

        // Aparición al desplazar
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: "0px 0px -8% 0px" });
        document.querySelectorAll(".reveal").forEach(function (el, i) {
            el.style.transitionDelay = (i % 4) * 70 + "ms";
            revealObserver.observe(el);
        });
    } else {
        document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-visible"); });
    }

    // Título con texto cambiante
    (function () {
        var target = document.getElementById("changing-title");
        if (!target || reduceMotion) return;

        var wordArray = [
            "Sendevo.",
            "Software.",
            "Simples.",
            "Soluciones.",
            "Sendevo.",
            "Software."
        ];
        var speed = 75; // Velocidad de tipeo (ms)
        var pauseLength = 20; // Duracion de pausa (x speed)
        var wordIndex = 0; // Palabra actual
        var charIndex = wordArray[0].length; // Caracter actual
        var pauseCnt = 0; // Contador pause
        var status = "IDLE"; // Estado animacion

        function nextWord() {
            var nextIndex;
            do {
                nextIndex = Math.floor(Math.random() * wordArray.length);
            } while (wordArray[nextIndex] === wordArray[wordIndex]);
            wordIndex = nextIndex;
            charIndex = 0;
            target.textContent = "";
        }

        setInterval(function () {
            if (status === "IDLE") {
                if (++pauseCnt >= pauseLength) {
                    pauseCnt = 0;
                    nextWord();
                    status = "WRITING";
                }
            } else {
                var word = wordArray[wordIndex];
                if (charIndex < word.length) {
                    target.textContent += word.charAt(charIndex++);
                } else {
                    status = "IDLE";
                }
            }
        }, speed);
    })();

    // Año en el pie de página
    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    // Formulario de contacto (Firebase Realtime Database)
    var form = document.getElementById("contact-form");
    var formMessage = form.querySelector(".form-message");
    var submitBtn = form.querySelector('button[type="submit"]');
    var database = null;

    function getDatabase() {
        if (!database && window.firebase) {
            firebase.initializeApp({
                apiKey: "AIzaSyAzPXh2y3txdmjnuX695g_l1uNCutdMaMU",
                authDomain: "sendevo-mailing.firebaseapp.com",
                databaseURL: "https://sendevo-mailing-default-rtdb.firebaseio.com",
                projectId: "sendevo-mailing",
                storageBucket: "sendevo-mailing.appspot.com",
                messagingSenderId: "602162181087",
                appId: "1:602162181087:web:ac3f237c8243765e83ca6a"
            });
            database = firebase.database();
        }
        return database;
    }

    function resultMessage(type, message) {
        formMessage.className = "form-message is-" + type;
        formMessage.textContent = message;
    }

    function validateField(input) {
        var field = input.closest(".field");
        var error = field.querySelector(".field-error");
        if (input.value.trim() === "") input.value = "";
        var valid = input.checkValidity();
        field.classList.toggle("has-error", !valid);
        input.setAttribute("aria-invalid", String(!valid));
        error.textContent = valid ? "" : (input.dataset.error || "");
        return valid;
    }

    form.querySelectorAll("input, textarea").forEach(function (input) {
        input.addEventListener("blur", function () {
            if (input.value !== "" || input.closest(".field").classList.contains("has-error")) validateField(input);
        });
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        var inputs = form.querySelectorAll("input, textarea");
        var firstInvalid = null;
        inputs.forEach(function (input) {
            if (!validateField(input) && !firstInvalid) firstInvalid = input;
        });
        if (firstInvalid) {
            firstInvalid.focus();
            resultMessage("error", "Debe completar todos los campos");
            return;
        }

        var db = getDatabase();
        if (!db) {
            resultMessage("error", "No se pudo enviar el mensaje. Escribinos a holasendevo@gmail.com");
            return;
        }

        var fields = form.elements;
        var formObject = {
            name: fields.name.value.trim(),
            email: fields.email.value.trim(),
            phone: fields.phone.value.trim(),
            message: fields.message.value.trim(),
            date: new Date().toISOString(),
            read: false
        };

        submitBtn.disabled = true;
        db.ref("sendevo_messages")
            .push(formObject)
            .then(function () {
                resultMessage("success", "Gracias por su mensaje. Le responderemos a la brevedad");
                form.reset();
            })
            .catch(function (err) {
                console.warn(err);
                resultMessage("error", "No se pudo enviar el mensaje. Escribinos a holasendevo@gmail.com");
            })
            .then(function () { submitBtn.disabled = false; });
    });
})();
