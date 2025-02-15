"use strict";

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js");
}

const searchEngineUrlsKey = "searchEngineUrls";
const defaultSearchEngineUrl = "https://www.google.com/search?q=%s";
const defaultSearchEngineUrls = [
    { name: "Google", url: "https://www.google.com/search?q=%s" },
    { name: "Bing", url: "https://www.bing.com/search?q=%s" },
    { name: "Brave", url: "https://search.brave.com/search?q=%s" },
    { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=%s" },
    { name: "Ecosia", url: "https://www.ecosia.org/search?q=%s" },
    { name: "Qwant", url: "https://www.qwant.com/?q=%s" }
];
const snoozeTimestampKey = "snoozeTimestamp";
const snoozeDurationMs = 1800000; // 30 minutes

window.onload = function () {
    drawSearchEngineList();
    window.addEventListener('keyup', function (event) {
        if (event.key === 'Enter') {
            searchButton();
        }
    });
}

function getSearchEngineUrlsJson() {
    var searchEngineUrlsJson = null;
    var searchEngineUrls = localStorage.getItem(searchEngineUrlsKey);
    if (searchEngineUrls !== null) {
        searchEngineUrlsJson = JSON.parse(searchEngineUrls);
    }
    else {
        searchEngineUrlsJson = defaultSearchEngineUrls.slice();
    }
    return searchEngineUrlsJson;
}

function searchButton() {
    var q = document.getElementById("q").value;
    if (q === "") { q = "Meta Random Search"; }
    var searchUrl = null;
    if (isSnoozeActive()) {
        searchUrl = defaultSearchEngineUrl.replace("%s", encodeURIComponent(q));
    }
    else {
        searchUrl = getRandomSearchUrl(q);
    }
    window.location.assign(searchUrl);
}

function snoozeButton() {
    var snoozeTimestamp = Date.now() + snoozeDurationMs;
    localStorage.setItem(snoozeTimestampKey, snoozeTimestamp);
    searchButton();
}

function isSnoozeActive() {
    var snoozeTimestamp = localStorage.getItem(snoozeTimestampKey);
    return (snoozeTimestamp !== null && snoozeTimestamp > Date.now());
}

function getRandomSearchUrl(text) {
    const biasTowardGoogle = 2
    var searchEngineUrlsJson = getSearchEngineUrlsJson();
    var nbSearchEngines = searchEngineUrlsJson.length;
    var randomIndex = Math.floor(Math.random() * nbSearchEngines * biasTowardGoogle);
    var searchEngineUrl;
    if (searchEngineUrlsJson[randomIndex] === 'undefined')
    {
        searchEngineUrl = defaultSearchEngineUrl;
    }
    else
    {
        searchEngineUrl = searchEngineUrlsJson[randomIndex].url
    }
    return searchEngineUrl.replace("%s", encodeURIComponent(text));
}

function drawSearchEngineList() {
    var searchEngineUrlsJson = getSearchEngineUrlsJson();
    let ulElement = document.getElementById('searchEngineList');
    ulElement.textContent = '';
    for (let searchEngineUrl of searchEngineUrlsJson) {
        let item = document.createElement('li');
        let aLink = document.createElement('a');
        aLink.href = searchEngineUrl.url;
        aLink.text = searchEngineUrl.name + " ";
        aLink.addEventListener("click", useSpecificSearchEngine); 
        let linkRemove = document.createElement('span');
        linkRemove.id = searchEngineUrl.name;
        linkRemove.title = "Remove " + searchEngineUrl.name;
        linkRemove.className = "fas fa-times-circle";
        linkRemove.addEventListener("click", removeSearchEngine);
        item.appendChild(aLink);
        item.appendChild(linkRemove);
        ulElement.appendChild(item);
    }
}

function useSpecificSearchEngine(mouseEvent) {
    var q = document.getElementById("q").value;
    if (q === "") { q = "Meta Random Search"; }
    mouseEvent.srcElement.href = mouseEvent.srcElement.href.replace("%s", encodeURIComponent(q));
}

function resetSearchEngineList() {
    $("#dialog-confirm").dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: true,
        buttons: {
            "Reset": function () {
                localStorage.removeItem(searchEngineUrlsKey);
                localStorage.removeItem(snoozeTimestampKey);
                drawSearchEngineList();
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}

function removeSearchEngine(mouseEvent) {
    var searchEngineUrlsJson = getSearchEngineUrlsJson();
    for (let [i, item] of searchEngineUrlsJson.entries()) {
        if (item.name == mouseEvent.srcElement.id) {
            searchEngineUrlsJson.splice(i, 1);
        }
    }
    localStorage.setItem(searchEngineUrlsKey, JSON.stringify(searchEngineUrlsJson));
    mouseEvent.srcElement.parentElement.remove();
}

function addSearchEngine() {
    $("#dialog-add").dialog({
        resizable: false,
        height: "auto",
        width: 500,
        modal: true,
        buttons: {
            "Add": function () {
                var addSearchEngineName = document.getElementById('addSearchEngineName').value;
                var addSearchEngineUrl = document.getElementById('addSearchEngineUrl').value;
                var newSearchEngine = { "name": addSearchEngineName, "url": addSearchEngineUrl };
                var searchEngineUrlsJson = getSearchEngineUrlsJson();
                searchEngineUrlsJson.push(newSearchEngine);
                localStorage.setItem(searchEngineUrlsKey, JSON.stringify(searchEngineUrlsJson));
                drawSearchEngineList();
                $(this).dialog("close");
            },
            Cancel: function () {
                $(this).dialog("close");
            }
        }
    });
}

function onChangeLstAddSearchEngine()
{
    var selectElement = document.getElementById('lstAddSearchEngine');
    if (selectElement.value != "")
    {
        document.getElementById('addSearchEngineName').style.display = "none";
        document.getElementById('lblAddSearchEngineUrl').style.display = "none";
        document.getElementById('addSearchEngineUrl').style.display = "none";
        document.getElementById('addSearchEngineUrlExample').style.display = "none";

        var addSearchEngineName = selectElement.options[selectElement.selectedIndex].text;
        var addSearchEngineUrl = selectElement.value;
        document.getElementById('addSearchEngineName').value = addSearchEngineName;
        document.getElementById('addSearchEngineUrl').value = addSearchEngineUrl;
    }
    else
    {
        document.getElementById('addSearchEngineName').value = "";
        document.getElementById('addSearchEngineUrl').value = "";

        document.getElementById('addSearchEngineName').style.display = "inline";
        document.getElementById('lblAddSearchEngineUrl').style.display = "inline";
        document.getElementById('addSearchEngineUrl').style.display = "inline";
        document.getElementById('addSearchEngineUrlExample').style.display = "inline";
    }
}