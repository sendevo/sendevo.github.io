! function () {
    function e(e) {
        document.documentElement.setAttribute("data-theme", e)
    }
    var t = function () {
        var e = null;
        try {
            e = new URLSearchParams(window.location.search).get("docusaurus-theme")
        } catch (e) {}
        return e
    }() || function () {
        var e = null;
        try {
            e = localStorage.getItem("theme")
        } catch (e) {}
        return e
    }();
    null !== t ? e(t) : window.matchMedia("(prefers-color-scheme: dark)").matches ? e("dark") : (window.matchMedia("(prefers-color-scheme: light)").matches, e("light"))
}();