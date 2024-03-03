/*
###############################################################################
#   Copyright (C) 2022 Jean-Michel Cohen, F4JDN <f4jdn@outlook.fr>
#
#   This program is free software; you can redistribute it and/or modify
#   it under the terms of the GNU General Public License as published by
#   the Free Software Foundation; either version 3 of the License, or
#   (at your option) any later version.
#
#   This program is distributed in the hope that it will be useful,
#   but WITHOUT ANY WARRANTY; without even the implied warranty of
#   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#   GNU General Public License for more details.
#
#   You should have received a copy of the GNU General Public License
#   along with this program; if not, write to the Free Software Foundation,
#   Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301  USA
*/

cookieSettingsName = "wxjson_settings";
settingsValidity = 5;	    // 5 days
settings = [{ "open": true }];

wxDevices = {
    "E0": "FT1DR/FT1XD",
    "E5": "FT2D",
    "EA": "FT3D",
		"EB": "FT5D",
    "EF": "FT5D",
    "F0": "FTM-400DR/FTM-400XDR",
    "F5": "FTM-100DR",
    "FA": "FTM-300",
		"FB": "FTM-200",
    "G0": "FT-991/FT-991A",
    "H0": "FTM-3200",
    "HA": "FT-3207",
    "HF": "FTM-7250",
    "H5": "FT70D",
    "R0": "Repeater DR-1/DR-1X",
		"R5": "Repeater DR-2X"
};

function getwxDevice(str) {
    var keys = Object.keys(wxDevices);

    for(let i=0; i<keys.length; i++) {
        if (str.startsWith(keys[i]))
            return wxDevices[keys[i]] + " - [" + str.substr(2) + "]";
    }

		const parsed = parseInt(str, 10);
  	if (isNaN(parsed))
			return str;

		if (parsed / 10000 % 2 == 0)
			return "ROOM"

		return "NODE"
}

String.prototype.capitalize = function (lower) {
    return (lower ? this.toLowerCase() : this).replace(/(?:^|\s|['`‘’.-])[^\x00-\x60^\x7B-\xDF](?!(\s|$))/g, function (a) {
        return a.toUpperCase();
    });
};

function createCookie(name, value, days) {
    var expires;

    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }
    
    document.cookie = encodeURIComponent(name) + "=" + encodeURIComponent(value) + expires + "; path=/";
}

function readCookie(name) {
    var nameEQ = encodeURIComponent(name) + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ')
            c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0)
            return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function getTgTableState(name) {
    for(let i=0; i < settings.length; i++) {
        if (settings[i].name != null && settings[i].name == name)
            return settings[i];
    }

    return null;
}

function saveSettings() {
    themeSettings = document.documentElement.className;
    settings = [
        { "config": { "theme": themeSettings, hidetg: hideAllTG } },
        { "map": { "zoom" : (map != null) ? map.getZoom() : 6.5 } },
        { "name": "openbridges",    "open": $('#openbridges').is(':visible'), "colspan": $("#theadOpenbridges tr th").length }, 
        { "name": "masters",        "open": $('#masters').is(':visible'), "colspan": $("#theadMasters tr th").length }, 
        { "name": "peers",          "open": $('#peers').is(':visible'), "colspan": $("#theadPeers tr th").length }
    ];

    if (tgorder != null) {
        tgorder.forEach(tg => {
            var tgName = "tgId"+tg;
            var tgId = "hblink"+tg;
            if (document.getElementById(tgName) != null)
                settings.push({ "name": tgId, "open": $("#" + tgId).is(":visible"), "colspan": $("#" + tgName + " tr th").length });
        });
    }
    
    createCookie(cookieSettingsName, JSON.stringify(settings), settingsValidity);

    alert("Sauvegarde effectuée");
}

function eraseCookie(name) {
    createCookie(name, "", -1);
}    

function adjustTheme() {
    if (themeSettings == "auto") {
        if (new Date().getHours() > 22) {
            if (document.documentElement.className != "theme-dark")
                document.documentElement.className = "theme-dark";
        }
        else {
            if (document.documentElement.className != "theme-light")
                document.documentElement.className = "theme-light";
        }
    }
}

// flags png coded in base64 to be local instead of downloaded to save bandwidth
const flag64 = []
flag64["at"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEXtKTnzcHv///9FjJx3AAAAGklEQVQI12NgIAuEQkAAwyoIWEAaA66dLAAA/KEk6+/EHQQAAAAASUVORK5CYII="
flag64["be"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAUBAMAAACUkLs9AAAAElBMVEXtKTkAAAD64ELyZTtUTBZVTRYE41wOAAAAG0lEQVQY02MQFBQUVVJSUmYAASBHZMRw4N4GAFi9EENfoBrcAAAAAElFTkSuQmCC"
flag64["bo"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB0AAAAUBAMAAACDsiv0AAAAD1BMVEXVKx4AeTT54wBTnSPhZhQzAYZEAAAAIUlEQVQY02NgoDFwQQEODEooQIHqfGMUYMAgiAIEqM0HACBCGM/oCyk+AAAAAElFTkSuQmCC"
flag64["ca"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAMAAADImI+JAAAAM1BMVEX/AAD/MDD/EBD/19f/QED/ICD/r6//////wMD/8PD/oKD/YGD/gID/b2//cHD/UFD/kJAQFQNAAAAAgUlEQVQoz62S2woDIQxEj5doou7l/7+2DwXbwupa2nkIjBwyGAa68oW40vdgKUugmUi2BVAOOGQBjADxFtS8A+xZZ6DW5s8CUJpvVYegAcQ+bBzt3r0bR6fPhzTemPzL+jT7dejhLszPY/I0Yjd3NOJW6xaxhVKoLrbn/2AIvzT8AWsMCOs6h1CtAAAAAElFTkSuQmCC"
flag64["ch"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANCAIAAAArLKlOAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAFHSURBVChTlVIxTgQxDPTYyR7wlOv5PAW6hpIWCR7CQjaxGWf3CqSjYKSN4sQzHjuL11rl/8ALrEABfs6VWEQNQRiUGe4OU4bcmJkKug9cVE8wXmtosWTWYLqfW5u68nF3z3VXJOHLO0Md4byfhxFSKZlJkYQD3lm8975ubY0AzMLSXsQYEoIhnunph+EVlGndVbWaLSKFtgx41rRbFRpi8MctPdzE27KQ3F02hFIsIKxGmgbl/gR9fdMYgvaUw0K4ze5CjjHcBOvkfMlkh5dS2VKyRU7zCR5i43ruYybLOzsRWaXQIe3lEZxeObsM+HqO1Fuhn8LMA10LOSQ0ymcpH2O+I7VJJT0d8NXl1yTp25XTmn9AqOQcgScBq9tsr+r+7nu+mOWk1GMoNdNNeDrKU2fEOldT3PPiui8NvRf+AyXjSFFWdPcfPqrVgMZwDRUAAAAASUVORK5CYII="
flag64["cl"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUBAMAAABohZD3AAAAFVBMVEUAOabVKx7///9Lc8AQRauQqNjf5vTwpxheAAAAKklEQVQY02NgAAElOGAgzDdG5bumhaDwWZQcUPjMxgakmY/KF0QFg40PAFkJGT1/YYOJAAAAAElFTkSuQmCC"
flag64["co"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEUAOJPOESb80RYoeTcGAAAAF0lEQVQI12NYBQELGKjOIAmEQkAAMQwA+9NB7HYGMdMAAAAASUVORK5CYII="
flag64["de"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAUBAMAAADxfUlCAAAAD1BMVEXdAAAAAAD/zgD0igBKAABdJSNsAAAAIUlEQVQY02MQRAMCDLQTcUEDDgz0BMZowIBBCQ0o0E4EAL4AHCF2rs9hAAAAAElFTkSuQmCC"
flag64["ec"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAnFBMVEX/3QBjXW2NoG8cXab52g9VfHBbgGsDTqLtHCQRVp1zWSBATXqEajvZwDK9uDSIb0bzzAamlB+MjkwSco+xmj/TzQ2HhWJoqpjQshTjwwguZ4jv0w1yWjJ5jFU0aoSchTe6mgnXthCFeUNPa3Hszwq1tDeEuCHNthSBfoFMZnSAdn6OtHh6hYbI19qtxcyrualnm5ywxxONo490umigh32sAAAAd0lEQVQoz2NgGBJAUoZfRJ6HSwKHNIuKIA+XgjQLLml1USE+UUVc0ryGTOLiTGq8OKQFRPR19YwEBZDF2BGAjVHbwJiJkRVJCEVaU0dYWEMZl7ScqpaYGCOfFA5pZjYhfiVZVmYc0uycnNzcnJzIIgwceMFASgMADGkODcjCRY0AAAAASUVORK5CYII="
flag64["es"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAVFBMVEX/xACzTwzTsbr8wgDUiSvFawfvwy/GCx7uwBrdmDK/rDnztgDZkjPblALJcSSyZgexOhHNsCfNsCjHjmXnvjC9j068d1F4RUKYUB18TVWvSxy6kqEyHguVAAAAVklEQVQoz83RSRLAIAhEUVQgzpp5uv89cwKsuEr+9lU1C2BoBl/y26xtqSNyIoaQiJIx4nKtWov7mMtx64zS5Xjt5+aiwLyoohSzwJPHdUY/Qmf/fegDe6kKdhTlmsEAAAAASUVORK5CYII="
flag64["fk"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAMAAADImI+JAAAA8FBMVEUBIWlgdKHUeY4jdLnYVmvyxs1nbprIEC7AyNoOLHElQH0gPHv6+Pm/x9kTfMfg5O1icJ7f4+xklr////8CWmX88fP21dqlbVO3jnmytsDZ3OfOu7aDsdUfdbuBj5y6vb8cOXmwg24zTISwlooJKG6+zdja2tqftsiigXRroc+81epXgLAggcmanYH13uN2bYIxfL2PaGCRlqwwfL2hYD+VvNgwh8Wpvs5godBvUkWNn7tHV4ijj4tOaZtSlcSLm7Tu7u7O0tUAYY8faXCMrsfAmYNzg5Osp5mysX3JiGJooMevm2aorYO1gWPJw6hikagBkklFAAAA+0lEQVQoz8XQ126DMBSA4UOAGFOTKFA2guyddO+9m3S9/9vUJ8ZSLyJ82f8COJxPQhgMs6UBzyLEwnu9ZpiwLVwgFRCnpgZQQRFWMstxnGQZ+B4hLPBZwkdHbNo7m9olJFvaLOjRyXmDt09V0B0MR6OzU72EFi9hfsAI8fxgmeAsoO4O2T3LJATQWqZRq+PPaE18Kl9TvfFQxMWthILJ4/lDqf74tMuTUC7kgSMVMPPG6ffCyyhU15/M3z8Wn/NJXwFhNvh5e86LmcrBzfrl1Y3yK5Wz02v3a5XHoa2AcRrdTaeXneMDBTzs9HrjizCM9pTfpna3yy/w3/0CuwMWbh/ZsdkAAAAASUVORK5CYII="
flag64["fr"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEUAI5XtKTn///+i/AH+AAAAFElEQVQI12NgYOBatSo0NIBh6DAATSAu4Xxi9HsAAAAASUVORK5CYII="
flag64["gb"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAMAAADImI+JAAAAPFBMVEX////xw8p8jbLnv8pBWY8OLHHw8vfIEC4BIWnWTGKAkLRAWI5LYZXgeIn10tigrMfheYrx2+Htz9hKYJTy9LpmAAAAqUlEQVQoz8XTQRaDIAwFwC8SLBYE9f53LRVCCbJw1yx8koyiMcJOgFH04tBYUkDXBKnZLkldh4Z2kBnAJ2alO6SVqwrtgiSk9iaQ19EPktwL/RYuQ9c/Et45znB467dUyHAvq3AWgHtccJx+Ev+Ej19G53DBAFu0cc/wu/I2HsEVwA1PhSl1eK4NrxluuGTtJ5QUksmhaCkk68dM1SokGwxuoR0b/Qp5zw/L/xHkHUeiPgAAAABJRU5ErkJggg=="
flag64["ie"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUBAMAAAANaGKIAAAAD1BMVEX/iD4Wm2L///+y3sv/176zaFdvAAAAF0lEQVQY02MQBANhJTBwYICAUcHBJAgAHJ0eZQMU55UAAAAASUVORK5CYII=";
flag64["it"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEUAkkbOKzf///85rJ3UAAAAFElEQVQI12NgYOBatSo0NIBh6DAATSAu4Xxi9HsAAAAASUVORK5CYII="
flag64["jm"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUBAMAAAANaGKIAAAAIVBMVEX/uBwAd0kAAACHYQ6XnS4SDQEZfkT1sBrxrRoef0PWmhdnQ13iAAAAbklEQVQY023RwQ2AMAgF0H+z8eYK7OAKTTx3BQdwBIdwYKEFUhp6fEnD5wPgOsL7ALyLshW0qGInSLSa3WIEmnWYILVHlW1j62hqNnCom2JXN8OuZgH3BbPv2aAs0hy+aHi3ac2skGBWXVpydo4fbqwzeoyE38IAAAAASUVORK5CYII="
flag64["jp"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUBAMAAABohZD3AAAAElBMVEW8AC3////NP2Dmn7DADzn77/GuzSpGAAAAP0lEQVQY02MQRAUM5PGNXJSR+UEMDAyqSHwFIJ8JwRdmAAFDOF8IzFeE80XAfEecfHT16Oah24fhHnT3ku9/AB+iE2XMgOg6AAAAAElFTkSuQmCC"
flag64["lu"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAUBAMAAADxfUlCAAAAD1BMVEXtKTkAod7///9VwenzcHusVZA/AAAAIUlEQVQY02NgoCNwQQMODEpoQIGGIsZowIBBEA0I0E4EAL4AHCFvjbcyAAAAAElFTkSuQmCC"
flag64["ma"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUBAMAAABohZD3AAAAFVBMVEXBJy1iQi5MSS+nLi2SNC2rLi15PC6Ld+IEAAAAKElEQVQY02NgGBjggsoNFjRF4TspqaDw2ZQSUPiMggIofGYGg4HxBwB4BQJD/6PdEAAAAABJRU5ErkJggg=="
flag64["mc"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAUAQMAAABCuQT+AAAABlBMVEXOESb///9W4q7JAAAAEklEQVQI12NgIBn8//+/gSQCAHAUIuOMnBoSAAAAAElFTkSuQmCC"
flag64["mu"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAADFBMVEUApVEaIG3qKDn/1QBAdqXLAAAAHUlEQVQI12NYBQELGIhhhEJAAFGM/xDwgSgGKQAAdktPG8262+oAAAAASUVORK5CYII="
flag64["nl"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUBAMAAABohZD3AAAAD1BMVEUhRotrhLKuHCjIZm7///9fvUPgAAAAHElEQVQY02NUYkABTAzU5bMI4udT2z5GNPNpDQBo2wB0uX4S5QAAAABJRU5ErkJggg=="
flag64["pt"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAn1BMVEX/AADzVwDqkQBTkQAAYQD7PT2yweAAZgD4AADjfACQtADCzQD8LS3xaS/ujhzraA/ipQDsmwCbugDdvwCpvwD2WA/qjlLKmVKEqACjuQDT2ADNorbO1+vk4QBKhwDgoifYuADspFr5Vj6MkiCHnRw1fQDwblvtLwDXngDvfSPsQjPNrVu9nKr8Ryj6u7utiFv5czicrteesNe8n6H7u7sxBDfVAAAAhElEQVQoz2NgRwIMmIBe0iwceKSZuSQ1mBhxSTNr64uLqSkyYpcWkeLj4eXV1VTgxCotKcVqIsOmx6rOhE2ahVuCT4fN0JiPU5gDuzSrNJuRNCt2aXYuVS0DGTZeJUFBrHYLcSuL8vCIystidxq7nJCKuBi/AD/uYBERwB0shAKV/vENAM1rDK2atilmAAAAAElFTkSuQmCC"
flag64["re"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEUAI5XtKTn///+i/AH+AAAAFElEQVQI12NgYOBatSo0NIBh6DAATSAu4Xxi9HsAAAAASUVORK5CYII="
flag64["ro"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUAgMAAADnxWVXAAAACVBMVEUAK3/OESb80RYeTc2tAAAAFElEQVQI12NgYOBatSo0NIBh6DAATSAu4Xxi9HsAAAAASUVORK5CYII="
flag64["rs"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAtFBMVEX////FO0HQZzTltLZykLAXQnbScTnGNjwMQHbANj7p19jjzMzTjY7jwsP47O3bl5XalCXUhCjuxMZtSWbVekOXgJSPd4vPW1rXe1LJUlbannTevsDFeDjVd2Pi0tPcnqHOo6Xq4+PIfoLQm53UqavGenzQbFzepmrcjDrJR0399fbFXTLMTjSJSknVn1WBZHzlyLbYgIO6WDrSfTTXpYzs29vera/x5OTIdnnPgobRh2vTgXFvR69fAAAAo0lEQVQoz73O1w6CQBBA0S24wi5LE6Qj1d57+f//MhGNIbg8ep4muZnJgH4n8B1hZ56tfHF2A7JeTMai7BHbJFNbeNw0TMNYtrJSg3sSHSIIlSYgv/R2caBuER7ITZ98OfvZyNWGgsxoXlRh4ggyT3KuplS0zdmNjgq6EWTMKnwtT63XpJp6V8v0qDtSE3iLySNjCGngt7mn8xBZQMjSsQb+6gluZBOQL+4JdQAAAABJRU5ErkJggg=="
flag64["us"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAUCAMAAADWUb86AAAANlBMVEXGWWZ5eJtdQ25tbJI8O25IR3dUU4DZkZqyIjT///+VlbCFhKRgX4mrU2fY1+KaJj+5fpCqqcBFmxQnAAAAh0lEQVQoz8XPSwrDMAxFUau6T0ks9bf/zXYQKBTs4kGhZ6CR0LUbQhAEBOK+DzVchSpK4VI8tqEGqSiZwmXidgw1GaZIWajLaxql406PMnUxjRomEg91PGZRSMLo5+DaxmSk9CRLHfPZGhhR72tff0qS5wNn1y6fZmvHkvZbi9FtSduX/CX6Asb+ET4hHaT8AAAAAElFTkSuQmCC"
flag64["uy"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAVFBMVEX///+7iRX07ePOql0dTrGqvOL8+/o5ZLsAOKiOpti0ghru5dfCkyPTs3D69/Xo3MvGnUvZqgzhy5fQnwtPdcPiza7cwILizKPWuInhsBCbsd20xOU60XNuAAAAcklEQVQYGaXBWRLCIBBAwTdAJoRlsrl7/3vqP0qqtJtjqlmVb9x8qd4cnMYGYD6JLFkJsQHmi+ySNuUxNcDVtN5XqZmP9JrKXsrNeA4N0LMvSRZTQmwAzvm6zRnG0OBNLavxk9BF7GLo4sDURexi7OIvL5HoCsLqMEQ5AAAAAElFTkSuQmCC"
flag64["za"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAb1BMVEUAd0kJe0/sqRn8txv///9AT6fobWUAAAAAFIngPDH07vKneBFQOQiMwq0SDQLd7ecvg0CAlzE1k27UrSOqsdg+mHX1wL3qd29OXK0SJZHW6eLiSkA5hj7ariKPmy/0u7eHmTAzhD+Xx7TjTEKYyLXXNRCBAAAAj0lEQVQoz32RWRLCIBAFHwQliVGDxn1f7n9GgSzFIEP/dr0upgAA8Vb7T5UEnt26PqR1671YqsclpQuTC6CR2xcfgF4timcf2Jz/AtBaN/J2nQJzgtMucB8DiuB1EIjpdRBgtDS8tue1bNyWDf+0aWoP62YEkGl9LCkg01MZ6+BL4qnTmanTmemgxTc9tfwA2zUQndqOrtoAAAAASUVORK5CYII="
flag64["bb"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAUCAMAAACtdX32AAAAPFBMVEX/xyabeBYzJweRcRX+xiWzjBoeFwQAJn9xWBBAMgloUA9aRgzwuyPksiHOoB7Vph94XhHerCC+lBvyvCQmVMjVAAAAYElEQVQoz82RSw7AIAhEUYGCn/rp/e/anWkace0s5yUwDHBNwdTHOwf3buJyA8QIcJclRh+y1xw8roeTgggoGbuRH5HMaEVLQ2REM3lQZnUmrpQS1c3drW1rce7Yj/3xC6MlDMxrrZFjAAAAAElFTkSuQmCC"
flag64["mx"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAAUCAMAAAAweHR+AAAAb1BMVEX////X07jb3cSUb1HeX23c383r6tYAaEfOESZVmoR3SSjm5M7Iwq7i2tCdx7yrx8DMtZ6Qqo+0n5R0Vj7PyKLLqnd+Y0r39++wtYzl27He0Mp0nJ/049JkOiKAVDqii4Brq62ahV6ziGBekH+8mHOqo5LtAAAAYklEQVQoz93RNxaAIBBFUYIYEAQkmLP7X6N2NJ6x59W3mH8GFbEKxbIyhhIwnTxX/WMGT/kygiZ3t+WcQqaenQ+h3RhgiDK6tVRiwDDW7JeZMIHuedGhiIB31Vj0eYI//TIPmiIRZ/iengEAAAAASUVORK5CYII="
flag64["noflag"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANCAMAAACTkM4rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAEXUExURQAAAJKSktXV1lNTUzs7O4mJibW1tVJSUtPT04iIiVVWVnd3eJqamr6+vuvr6/b29nJzc01NTygnJ8nHx+jo6PDw8Ovr7MrJyCMiIrGwsHx9fVFRUaioqJ2dnU9PT4aGhrOzsyMjIg4ODnd3dyoqKh8fH3h4eG5ubx0dHTMzM4B/fg8PDwQEBHRzc2xtbWlpaY6OjouLjGtra3V1dXd2djAwMKmop9LR0YyMjIyLi9PS0qOjozExMQUFBRkZGYeHiKCgoaKiooqLjH5+fmFhYp+goL2+vnBxcKOjore3tri4t2lqa7i5uZCQkWZmZhISEmlpare3uGpqapGRknx+fy0tLggICCMjJCQkJQkJCSwtLX+AgRsbGxD+1OUAAAAJcEhZcwAADr8AAA6/ATgFUyQAAACfSURBVBhXdcjXAoEAGEDhX5JVIdl7r+w9ighZZe/3fw4u/kvO3fngdwbCSJooykSaLVYkm51mWIeDZWin6z8B52Z5j4f3+jgEAH8gGApHorF4AgEgmUpnsrl8oVhCABDKlWqt3mi2BIRv7U631x8MR7gAojSeyAwjT2eSiKTMF0t1tVY327mCtCM0fX84HHWNOCFJ5wtcb/cHPF9vAPgAEyIU6qDlHbIAAAAASUVORK5CYII="
flag64["shield"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANCAMAAACTkM4rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURQAAAAUFBQoKCv///wEBAQ0NDQ8PDwMDAw4ODgICAhAQEC8vL6urqwYGBqqqqoGBgQQEBDExMQwMDBgYGM7OzgcHBxsbGxoaGggICB0dHT4+Pj09PdDhOekAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB5SURBVBhXXY3bDoJADETH6aILaOUqIP//n7RdSYjz0uTMaQvc+BeAlEucpIo2zwirVFD090f29opyfSK3i1U3BYGt8Bno5a2dt48aGpvMt7IzlNiHFg/7wfaAbjRNJyc6umTa/FGXRHSZQzK2bl+Dum/rjzjyQxEAB6niBHSSJ9cvAAAAAElFTkSuQmCC"
flag64["unlicenced"] = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAANCAMAAACTkM4rAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAABUUExURQAAAAUFBQoKCv///wEBAQ0NDQ8PDwMDAw4ODgICAhAQEC8vL6urqwYGBqqqqoGBgQQEBDExMQwMDBgYGM7OzgcHBxsbGxoaGggICB0dHT4+Pj09PdDhOekAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAB5SURBVBhXXY3bDoJADETH6aILaOUqIP//n7RdSYjz0uTMaQvc+BeAlEucpIo2zwirVFD090f29opyfSK3i1U3BYGt8Bno5a2dt48aGpvMt7IzlNiHFg/7wfaAbjRNJyc6umTa/FGXRHSZQzK2bl+Dum/rjzjyQxEAB6niBHSSJ9cvAAAAAElFTkSuQmCC"

function getConfigFromLocalStorage() {
    map = null;

    // retrieve settings
    if ((cookie = JSON.parse(readCookie(cookieSettingsName))) == null) {
        cookie = settings;
        createCookie(cookieSettingsName, JSON.stringify(settings), settingsValidity);
    }
    else    
        settings = cookie;

    themeSettings = "theme-dark";

    for(let i=0; i < settings.length; i++) {
        var tbs = settings[i];

        if (tbs.config) {
            themeSettings = tbs.config.theme;
            hideAllTG = tbs.config.hidetg;

            if (themeSettings == "auto")
                adjustTheme();
            else
                document.documentElement.className = themeSettings;
        }
        else {            
            if (tbs.map) {
                currentZoom = tbs.map.zoom;
            }
            else {
                if (tbs.open) {
                    $("#"+tbs.name).show();                                                            
                    // var count = tbs.colspan;
                    // if (count == null)
                    //     count = 5;
                    // $("#"+tbs.name).append("<tr><td class='infoline' colspan="+(count+1)+">Mise à jour au prochain appel entrant...</td></tr>");
                }
                else
                    $("#"+tbs.name).hide();
            }
        }
    }
}

function getFlag(str) {
		if (str.indexOf(" ") == -1) {
			for(let i=0; i < callsigns.length; i++) {
				callsignGroup = callsigns[i].prefix.split(",");

				// AA-AB, DD-EE
				for(let g=0; g < callsignGroup.length; g++) {
					var subGroup = callsignGroup[g].split("-");
					
					if (subGroup.length == 1)
						subGroup.push(subGroup[0]);

					// AA-AB
					var start = subGroup[0];
					var end = subGroup[1];

					var p = str.substr(0, subGroup[0].length);

					if (p >= start && p <= end) {
						let countryCode = callsigns[i].code.toLowerCase();
						if (flag64[countryCode.toLowerCase()] != null)
							return flag64[countryCode]
		
						return "https://flagcdn.com/h20/" + countryCode + ".png";
					}
				}
			}
		}

		return "shield.png";
}

callsigns = [
    {
			"prefix": "AA-AL",
    	"country": "United States",
			"code": "US"
    }, {
    	"prefix": "AM-AO",
    	"country": "Spain",
			"code": "ES"
    }, {
			"prefix": "AP-AS",
    	"country": "Pakistan",
			"code": "PK"
    }, {
    	"prefix": "AT-AW",
    	"country": "India",
			"code": "IN"
    }, {
    	"prefix": "AX",
    	"country": "Australia",
			"code": "AU"
    }, {
    	"prefix": "AY-AZ",
    	"country": "Argentina",
			"code": "AR"
    }, {
    	"prefix": "A2",
    	"country": "Botswana",
			"code": "BW"
    }, {
    	"prefix": "A3",
    	"country": "Tonga",
			"code": "TO"
    }, {
    	"prefix": "A4",
    	"country": "Oman",
			"code": "OM"
    }, {
    	"prefix": "A5",
    	"country": "Bhutan",
			"code": "BT"
    }, {
    	"prefix": "A6",
    	"country": "United Arab Emirates",
			"code": "AE"
    }, {
    	"prefix": "A7",
    	"country": "Qatar",
			"code": "QA"
    }, {
    	"prefix": "A8",
    	"country": "Liberia",
			"code": "LR"
    }, {
    	"prefix": "A9",
    	"country": "Bahrain",
			"code": "BH"
    }, {
    	"prefix": "B",
    	"country": "China",
			"code": "CN"
    }, {
    	"prefix": "BM-BQ, BU-BX",
    	"country": "Taiwan",
			"code": "TW"
    }, {
    	"prefix": "CA-CE",
    	"country": "Chile",
			"code": "CL"
    }, {
    	"prefix": "CF-CK",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "CL-CM",
    	"country": "Cuba",
			"code": "CU"
    }, {
    	"prefix": "CN",
    	"country": "Morocco",
			"code": "MA"
    }, {
    	"prefix": "CO",
    	"country": "Cuba",
			"code": "CU"
    }, {
    	"prefix": "CP",
    	"country": "Bolivia",
			"code": "BO"
    }, {
    	"prefix": "CQ-CU",
    	"country": "Portugal",
			"code": "PT"
    }, {
    	"prefix": "CV-CX",
    	"country": "Uruguay",
			"code": "UY"
    }, {
    	"prefix": "CY-CZ",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "C2",
    	"country": "Nauru",
			"code": "NR"
    }, {
    	"prefix": "C3",
    	"country": "Andorra",
			"code": "AD"
    }, {
    	"prefix": "C4",
    	"country": "Cyprus",
			"code": "CY"
    }, {
    	"prefix": "C5",
    	"country": "Gambia",
			"code": "GM"
    }, {
    	"prefix": "C6",
    	"country": "Bahamas",
			"code": "BS"
    }, {
    	"prefix": "C7",
    	"country": "World Meteorological Organization[Note 2]",
			"code": "WW"
    }, {
    	"prefix": "C8-C9",
    	"country": "Mozambique",
			"code": "MZ"
    }, {
    	"prefix": "DA-DR",
    	"country": "Germany",
			"code": "DE"
    }, {
    	"prefix": "DS-DT",
    	"country": "South Korea",
			"code": "KR"
    }, {
    	"prefix": "DU-DZ",
    	"country": "Philippines",
			"code": "PH"
    }, {
    	"prefix": "D2-D3",
    	"country": "Angola",
			"code": "AO"
    }, {
    	"prefix": "D4",
    	"country": "Cape Verde",
			"code": "CV"
    }, {
    	"prefix": "D5",
    	"country": "Liberia",
			"code": "LR"
    }, {
    	"prefix": "D6",
    	"country": "Comoros",
			"code": "KM"
    }, {
    	"prefix": "D7-D9",
    	"country": "South Korea",
			"code": "KR"
    }, {
    	"prefix": "EA-EH",
    	"country": "Spain",
			"code": "ES"
    }, {
    	"prefix": "EI-EJ",
    	"country": "Ireland",
			"code": "IE"
    }, {
    	"prefix": "EK",
    	"country": "Armenia",
			"code": "AM"
    }, {
    	"prefix": "EL",
    	"country": "Liberia",
			"code": "LR"
    }, {
    	"prefix": "EM-EO",
    	"country": "Ukraine",
			"code": "UA"
    }, {
    	"prefix": "EP-EQ",
    	"country": "Iran",
			"code": "IR"
    }, {
    	"prefix": "ER",
    	"country": "Moldova",
			"code": "MD"
    }, {
    	"prefix": "ES",
    	"country": "Estonia",
			"code": "EE"
    }, {
    	"prefix": "ET",
    	"country": "Ethiopia",
			"code": "ET"
    }, {
    	"prefix": "EU-EW",
    	"country": "Belarus",
			"code": "BY"
    }, {
    	"prefix": "EX",
    	"country": "Kyrgyzstan",
			"code": "KG"
    }, {
    	"prefix": "EY",
    	"country": "Tajikistan",
			"code": "TJ"
    }, {
    	"prefix": "EZ",
    	"country": "Turkmenistan",
			"code": "TM"
    }, {
    	"prefix": "E2",
    	"country": "Thailand",
			"code": "TH"
    }, {
    	"prefix": "E3",
    	"country": "Eritrea",
			"code": "ER"
    }, {
    	"prefix": "E4",
    	"country": "Palestinian Authority",
			"code": "PS"
    }, {
    	"prefix": "E5",
    	"country": "Cook Islands",
			"code": "CK"
    }, {
    	"prefix": "E6",
    	"country": "Niue",
			"code": "NU"
    }, {
    	"prefix": "E7",
    	"country": "Bosnia and Herzegovina",
			"code": "BA"
    }, {
    	"prefix": "F",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "G",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "HA",
    	"country": "Hungary",
			"code": "HU"
    }, {
    	"prefix": "HB",
    	"country": "Switzerland",
			"code": "CH"
    }, {
    	"prefix": "HB0, HB3Y, HBL",
    	"country": "Liechtenstein",
			"code": "LI"
    }, {
    	"prefix": "HC-HD",
    	"country": "Ecuador",
			"code": "EC"
    }, {
    	"prefix": "HE",
    	"country": "Switzerland",
			"code": "CH"
    }, {
    	"prefix": "HF",
    	"country": "Poland",
			"code": "PL"
    }, {
    	"prefix": "HG",
    	"country": "Hungary",
			"code": "HU"
    }, {
    	"prefix": "HH",
    	"country": "Haiti",
			"code": "HT"
    }, {
    	"prefix": "HI",
    	"country": "Dominican Republic",
			"code": "DO"
    }, {
    	"prefix": "HJ-HK",
    	"country": "Colombia",
			"code": "CO"
    }, {
    	"prefix": "HL",
    	"country": "South Korea",
			"code": "KR"
    }, {
    	"prefix": "HM",
    	"country": "North Korea",
			"code": "KP"
    }, {
    	"prefix": "HN",
    	"country": "Iraq",
			"code": "IQ"
    }, {
    	"prefix": "HO-HP",
    	"country": "Panama",
			"code": "PA"
    }, {
    	"prefix": "HQ-HR",
    	"country": "Honduras",
			"code": "HN"
    }, {
    	"prefix": "HS",
    	"country": "Thailand",
			"code": "TH"
    }, {
    	"prefix": "HT",
    	"country": "Nicaragua",
			"code": "NI"
    }, {
    	"prefix": "HU",
    	"country": "El Salvador",
			"code": "SV"
    }, {
    	"prefix": "HV",
    	"country": "Vatican City",
			"code": "VA"
    }, {
    	"prefix": "HW-HY",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "HZ",
    	"country": "Saudi Arabia",
			"code": "SA"
    }, {
    	"prefix": "H2",
    	"country": "Cyprus",
			"code": "CY"
    }, {
    	"prefix": "H3",
    	"country": "Panama",
			"code": "PA"
    }, {
    	"prefix": "H4",
    	"country": "Solomon Islands",
			"code": "SB"
    }, {
    	"prefix": "H6-H7",
    	"country": "Nicaragua",
			"code": "NI"
    }, {
    	"prefix": "H8-H9",
    	"country": "Panama",
			"code": "PA"
    }, {
    	"prefix": "I",
    	"country": "Italy",
			"code": "IT"
    }, {
    	"prefix": "JA-JS",
    	"country": "Japan",
			"code": "JP"
    }, {
    	"prefix": "JT-JV",
    	"country": "Mongolia",
			"code": "MN"
    }, {
    	"prefix": "JW-JX",
    	"country": "Norway",
			"code": "NO"
    }, {
    	"prefix": "JY",
    	"country": "Jordan",
			"code": "JO"
    }, {
    	"prefix": "JZ",
    	"country": "Indonesia",
			"code": "ID"
    }, {
    	"prefix": "J2",
    	"country": "Djibouti",
			"code": "DJ"
    }, {
    	"prefix": "J3",
    	"country": "Grenada",
			"code": "GD"
    }, {
    	"prefix": "J4",
    	"country": "Greece",
			"code": "GR"
    }, {
    	"prefix": "J5",
    	"country": "Guinea-Bissau",
			"code": "GW"
    }, {
    	"prefix": "J6",
    	"country": "Saint Lucia",
			"code": "LC"
    }, {
    	"prefix": "J7",
    	"country": "Dominica",
			"code": "DM"
    }, {
    	"prefix": "J8",
    	"country": "Saint Vincent and the Grenadines",
			"code": "VC"
    }, {
    	"prefix": "K",
    	"country": "United States",
			"code": "US"
    }, {
    	"prefix": "LA-LN",
    	"country": "Norway",
			"code": "NO"
    }, {
    	"prefix": "LO-LW",
    	"country": "Argentina",
			"code": "AR"
    }, {
    	"prefix": "LX",
    	"country": "Luxembourg",
			"code": "LU"
    }, {
    	"prefix": "LY",
    	"country": "Lithuania",
			"code": "LT"
    }, {
    	"prefix": "LZ",
    	"country": "Bulgaria",
			"code": "BG"
    }, {
    	"prefix": "L2-L9",
    	"country": "Argentina",
			"code": "AR"
    }, {
    	"prefix": "M",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "N",
    	"country": "United States",
			"code": "US"
    }, {
    	"prefix": "OA-OC",
    	"country": "Peru",
			"code": "PE"
    }, {
    	"prefix": "OD",
    	"country": "Lebanon",
			"code": "LB"
    }, {
    	"prefix": "OE",
    	"country": "Austria",
			"code": "AT"
    }, {
    	"prefix": "OF-OJ",
    	"country": "Finland",
			"code": "FI"
    }, {
    	"prefix": "OK-OL",
    	"country": "Czech Republic",
			"code": "CZ"
    }, {
    	"prefix": "OM",
    	"country": "Slovakia",
			"code": "SK"
    }, {
    	"prefix": "ON-OT",
    	"country": "Belgium",
			"code": "BE"
    }, {
    	"prefix": "OU-OZ",
    	"country": "Denmark",
			"code": "DK"
    }, {
    	"prefix": "PA-PI",
    	"country": "Netherlands",
			"code": "NL"
    }, {
    	"prefix": "PJ",
    	"country": "Former Netherlands Antilles",
			"code": "BQ"
    }, {
    	"prefix": "PK-PO",
    	"country": "Indonesia",
			"code": "ID"
    }, {
    	"prefix": "PP-PY",
    	"country": "Brazil",
			"code": "BR"
    }, {
    	"prefix": "PZ",
    	"country": "Suriname",
			"code": "SR"
    }, {
    	"prefix": "P2",
    	"country": "Papua New Guinea",
			"code": "PG"
    }, {
    	"prefix": "P3",
    	"country": "Cyprus",
			"code": "CY"
    }, {
    	"prefix": "P4",
    	"country": "Aruba",
			"code": "AW"
    }, {
    	"prefix": "P5-P9",
    	"country": "North Korea",
			"code": "KP"
    }, {
    	"prefix": "R",
    	"country": "Russian Federation",
			"code": "RU"
    }, {
    	"prefix": "SA-SM",
    	"country": "Sweden",
			"code": "SE"
    }, {
    	"prefix": "SN-SR",
    	"country": "Poland",
			"code": "PL"
    }, {
    	"prefix": "SSA-SSM",
    	"country": "Egypt",
			"code": "EG"
    }, {
    	"prefix": "SSN-STZ",
    	"country": "Sudan",
			"code": "SD"
    }, {
    	"prefix": "SU",
    	"country": "Egypt",
			"code": "EG"
    }, {
    	"prefix": "SV-SZ",
    	"country": "Greece",
			"code": "GR"
    }, {
    	"prefix": "S2-S3",
    	"country": "Bangladesh",
			"code": "BD"
    }, {
    	"prefix": "S5",
    	"country": "Slovenia",
			"code": "SI"
    }, {
    	"prefix": "S6",
    	"country": "Singapore",
			"code": "SG"
    }, {
    	"prefix": "S7",
    	"country": "Seychelles",
			"code": "SC"
    }, {
    	"prefix": "S8",
    	"country": "South Africa",
			"code": "ZA"
    }, {
    	"prefix": "S9",
    	"country": "São Tomé and Príncipe",
			"code": "ST"
    }, {
    	"prefix": "TA-TC",
    	"country": "Turkey",
			"code": "TR"
    }, {
    	"prefix": "TD",
    	"country": "Guatemala",
			"code": "GT"
    }, {
    	"prefix": "TE",
    	"country": "Costa Rica",
			"code": "CR"
    }, {
    	"prefix": "TF",
    	"country": "Iceland",
			"code": "IS"
    }, {
    	"prefix": "TG",
    	"country": "Guatemala",
			"code": "GT"
    }, {
    	"prefix": "TH",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "TI",
    	"country": "Costa Rica",
			"code": "CR"
    }, {
    	"prefix": "TJ",
    	"country": "Cameroon",
			"code": "CM"
    }, {
    	"prefix": "TK",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "TL",
    	"country": "Central African Republic",
			"code": "CF"
    }, {
    	"prefix": "TM",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "TN",
    	"country": "Republic of the Congo",
			"code": "CG"
    }, {
    	"prefix": "TO-TQ",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "TR",
    	"country": "Gabon",
			"code": "GA"
    }, {
    	"prefix": "TS",
    	"country": "Tunisia",
			"code": "TN"
    }, {
    	"prefix": "TT",
    	"country": "Chad",
			"code": "TD"
    }, {
    	"prefix": "TU",
    	"country": "Ivory Coast",
			"code": "CI"
    }, {
    	"prefix": "TV-TX",
    	"country": "France",
			"code": "FR"
    }, {
    	"prefix": "TY",
    	"country": "Benin",
			"code": "BJ"
    }, {
    	"prefix": "TZ",
    	"country": "Mali",
			"code": "ML"
    }, {
    	"prefix": "T2",
    	"country": "Tuvalu",
			"code": "TV"
    }, {
    	"prefix": "T3",
    	"country": "Kiribati",
			"code": "KI"
    }, {
    	"prefix": "T4",
    	"country": "Cuba",
			"code": "CU"
    }, {
    	"prefix": "T5",
    	"country": "Somalia",
			"code": "SO"
    }, {
    	"prefix": "T6",
    	"country": "Afghanistan",
			"code": "AF"
    }, {
    	"prefix": "T7",
    	"country": "San Marino",
			"code": "SM"
    }, {
    	"prefix": "T8",
    	"country": "Palau",
			"code": "PW"
    }, {
    	"prefix": "UA-UI",
			"country": "Russian Federation",
			"code": "RU"
			}, {
    	"prefix": "UJ-UM",
    	"country": "Uzbekistan",
			"code": "UZ"
    }, {
    	"prefix": "UN-UQ",
    	"country": "Kazakhstan",
			"code": "KZ"
    }, {
    	"prefix": "UR-UZ",
    	"country": "Ukraine",
			"code": "UA"
    }, {
    	"prefix": "VA-VG",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "VH-VN",
    	"country": "Australia",
			"code": "AU"
    }, {
    	"prefix": "VO",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "VP-VQ",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "VR",
    	"country": "Hong Kong",
			"code": "HK"
    }, {
    	"prefix": "VS",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "VT-VW",
    	"country": "India",
			"code": "IN"
    }, {
    	"prefix": "VX-VY",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "VZ",
    	"country": "Australia",
			"code": "AU"
    }, {
    	"prefix": "V2",
    	"country": "Antigua and Barbuda",
			"code": "AG"
    }, {
    	"prefix": "V3",
    	"country": "Belize",
			"code": "BZ"
    }, {
    	"prefix": "V4",
    	"country": "Saint Kitts and Nevis",
			"code": "KN"
    }, {
    	"prefix": "V5",
    	"country": "Namibia",
			"code": "NA"
    }, {
    	"prefix": "V6",
    	"country": "Federated States of Micronesia",
			"code": "FM"
    }, {
    	"prefix": "V7",
    	"country": "Marshall Islands",
			"code": "MH"
    }, {
    	"prefix": "V8",
    	"country": "Brunei",
			"code": "BN"
    }, {
    	"prefix": "W",
    	"country": "United States",
			"code": "US"
    }, {
    	"prefix": "XA-XI",
    	"country": "Mexico",
			"code": "MX"
    }, {
    	"prefix": "XJ-XO",
    	"country": "Canada",
			"code": "CA"
    }, {
    	"prefix": "XP",
    	"country": "Denmark",
			"code": "DK"
    }, {
    	"prefix": "XQ-XR",
    	"country": "Chile",
			"code": "CL"
    }, {
    	"prefix": "XS",
    	"country": "China",
			"code": "CN"
    }, {
    	"prefix": "XT",
    	"country": "Burkina Faso",
			"code": "BF"
    }, {
    	"prefix": "XU",
    	"country": "Cambodia",
			"code": "KH"
    }, {
    	"prefix": "XV",
    	"country": "Vietnam",
			"code": "VN"
    }, {
    	"prefix": "XW",
    	"country": "Laos",
			"code": "LA"
    }, {
    	"prefix": "XX",
    	"country": "Macao",
			"code": "MO"
    }, {
    	"prefix": "XY-XZ",
			"country": "Myanmar",
			"code": "MM"
		}, {
    	"prefix": "YA",
			"country": "Afghanistan",
			"code": "AF"
		}, {
    	"prefix": "YB-YH",
    	"country": "Indonesia",
			"code": "ID"
    }, {
    	"prefix": "YI",
    	"country": "Iraq",
			"code": "IQ"
    }, {
    	"prefix": "YJ",
    	"country": "Vanuatu",
			"code": "VU"
    }, {
    	"prefix": "YK",
    	"country": "Syria",
			"code": "SY"
    }, {
    	"prefix": "YL",
    	"country": "Latvia",
			"code": "LV"
    }, {
    	"prefix": "YM",
    	"country": "Turkey",
			"code": "TR"
    }, {
    	"prefix": "YN",
    	"country": "Nicaragua",
			"code": "NI"
    }, {
    	"prefix": "YO-YR",
    	"country": "Romania",
			"code": "RO"
    }, {
    	"prefix": "YS",
    	"country": "El Salvador",
			"code": "SV"
    }, {
    	"prefix": "YT-YU",
    	"country": "Serbia",
			"code": "RS"
    }, {
    	"prefix": "YV-YY",
    	"country": "Venezuela",
			"code": "VE"
    }, {
    	"prefix": "Y2-Y9",
    	"country": "Germany",
			"code": "DE"
    }, {
    	"prefix": "ZA",
    	"country": "Albania",
			"code": "AL"
    }, {
    	"prefix": "ZB-ZJ",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "ZK-ZM",
    	"country": "New Zealand",
			"code": "NZ"
    }, {
    	"prefix": "ZN-ZO",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "ZP",
    	"country": "Paraguay",
			"code": "PY"
    }, {
    	"prefix": "ZQ",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "ZR-ZU",
    	"country": "South Africa",
			"code": "ZA"
    }, {
    	"prefix": "ZV-ZZ",
    	"country": "Brazil",
			"code": "BR"
    }, {
    	"prefix": "Z2",
    	"country": "Zimbabwe",
			"code": "ZW"
    }, {
    	"prefix": "Z3",
    	"country": "North Macedonia",
			"code": "MK"
    }, {
    	"prefix": "Z8",
    	"country": "South Sudan",
			"code": "SS"
    }, {
    	"prefix": "2",
    	"country": "United Kingdom",
			"code": "GB"
    }, {
    	"prefix": "3A",
    	"country": "Monaco",
			"code": "MC"
    }, {
    	"prefix": "3B",
    	"country": "Mauritius",
			"code": "MU"
    }, {
    	"prefix": "3C",
    	"country": "Equatorial Guinea",
			"code": "GQ"
    }, {
    	"prefix": "3DA-3DM",
    	"country": "Eswatini",
			"code": "SZ"
    }, {
    	"prefix": "3DN-3DZ",
    	"country": "Fiji",
			"code": "FJ"
    }, {
    	"prefix": "3E-3F",
    	"country": "Panama",
			"code": "PA"
    }, {
    	"prefix": "3G",
    	"country": "Chile",
			"code": "CL"
    }, {
    	"prefix": "3H-3U",
    	"country": "China",
			"code": "CN"
    }, {
    	"prefix": "3V",
    	"country": "Tunisia",
			"code": "TN"
    }, {
    	"prefix": "3W",
    	"country": "Vietnam",
			"code": "VN"
    }, {
    	"prefix": "3X",
    	"country": "Guinea",
			"code": "GN"
    }, {
    	"prefix": "3Y",
    	"country": "Norway",
			"code": "NO"
    }, {
    	"prefix": "3Z",
    	"country": "Poland",
			"code": "PL"
    }, {
    	"prefix": "4A-4C",
    	"country": "Mexico",
			"code": "MX"
    }, {
    	"prefix": "4D-4I",
    	"country": "Philippines",
			"code": "PH"
    }, {
    	"prefix": "4J-4K",
    	"country": "Azerbaijan",
			"code": "AZ"
    }, {
    	"prefix": "4L",
    	"country": "Georgia",
			"code": "GE"
    }, {
    	"prefix": "4M",
    	"country": "Venezuela",
			"code": "VE"
    }, {
    	"prefix": "4O",
    	"country": "Montenegro",
			"code": "ME"
    }, {
    	"prefix": "4P-4S",
    	"country": "Sri Lanka",
			"code": "LK"			
    }, {
    	"prefix": "4T",
    	"country": "Peru",
			"code": "PE"
    }, {
    	"prefix": "4U",
    	"country": "United Nations",
			"code": "UN"
    }, {
    	"prefix": "4V",
    	"country": "Haiti",
			"code": "HT"
    }, {
    	"prefix": "4W",
			"country": "East Timor",
			"code": "TL"
			}, {
    	"prefix": "4X",
    	"country": "Israel",
			"code": "IL"
    }, {
    	"prefix": "4Y",
    	"country": "International Civil Aviation Organization",
			"code": "ICAO"
    }, {
    	"prefix": "4Z",
    	"country": "Israel",
			"code": "IL"
    }, {
    	"prefix": "5A",
    	"country": "Libya",
			"code": "LY"
    }, {
    	"prefix": "5B",
    	"country": "Cyprus",
			"code": "CY"
    }, {
    	"prefix": "5C-5G",
    	"country": "Morocco",
			"code": "MA"
    }, {
    	"prefix": "5H-5I",
    	"country": "Tanzania",
			"code": "TZ"
    }, {
    	"prefix": "5J-5K",
    	"country": "Colombia",
			"code": "CO"
    }, {
    	"prefix": "5L-5M",
    	"country": "Liberia",
			"code": "LR"
    }, {
    	"prefix": "5N-5O",
    	"country": "Nigeria",
			"code": "NG"
    }, {
    	"prefix": "5P-5Q",
    	"country": "Denmark",
			"code": "DK"
    }, {
    	"prefix": "5R-5S",
    	"country": "Madagascar",
			"code": "MG"
    }, {
    	"prefix": "5T",
    	"country": "Mauritania",
			"code": "MR"
    }, {
    	"prefix": "5U",
    	"country": "Niger",
			"code": "NE"
    }, {
    	"prefix": "5V",
    	"country": "Togo",
			"code": "TG"
    }, {
    	"prefix": "5W",
    	"country": "Western Samoa",
			"code": "WS"
    }, {
    	"prefix": "5X",
    	"country": "Uganda",
			"code": "UG"
    }, {
    	"prefix": "5Y-5Z",
    	"country": "Kenya",
			"code": "KE"
    }, {
    	"prefix": "6A-6B",
    	"country": "Egypt",
			"code": "EG"
    }, {
    	"prefix": "6C",
    	"country": "Syria",
			"code": "SY"
    }, {
    	"prefix": "6D-6J",
    	"country": "Mexico",
			"code": "MX"
    }, {
    	"prefix": "6K-6N",
    	"country": "South Korea",
			"code": "KR"
    }, {
    	"prefix": "6O",
    	"country": "Somalia",
			"code": "SO"
    }, {
    	"prefix": "6P-6S",
    	"country": "Pakistan",
			"code": "PK"
    }, {
    	"prefix": "6T-6U",
    	"country": "Sudan",
			"code": "SD"
    }, {
    	"prefix": "6V-6W",
    	"country": "Senegal",
			"code": "SN"
    }, {
    	"prefix": "6X",
    	"country": "Madagascar",
			"code": "MG"
    }, {
    	"prefix": "6Y",
    	"country": "Jamaica",
			"code": "JM"
    }, {
    	"prefix": "6Z",
    	"country": "Liberia",
			"code": "LR"
    }, {
    	"prefix": "7A-7I",
    	"country": "Indonesia",
			"code": "ID"
    }, {
    	"prefix": "7J-7N",
    	"country": "Japan",
			"code": "JP"
    }, {
    	"prefix": "7O",
    	"country": "Yemen",
			"code": "YE"
    }, {
    	"prefix": "7P",
    	"country": "Lesotho",
			"code": "LS"
    }, {
    	"prefix": "7Q",
    	"country": "Malawi",
			"code": "MW"
    }, {
    	"prefix": "7R",
    	"country": "Algeria",
			"code": "DZ"
    }, {
    	"prefix": "7S",
    	"country": "Sweden",
			"code": "SE"
    }, {
    	"prefix": "7T-7Y",
    	"country": "Algeria",
			"code": "DZ"
    }, {
    	"prefix": "7Z",
    	"country": "Saudi Arabia",
			"code": "SA"
    }, {
    	"prefix": "8A-8I",
    	"country": "Indonesia",
			"code": "ID"
    }, {
    	"prefix": "8J-8N",
    	"country": "Japan",
			"code": "JP"
    }, {
    	"prefix": "8O",
    	"country": "Botswana",
			"code": "BW"
    }, {
    	"prefix": "8P",
    	"country": "Barbados",
			"code": "BB"
    }, {
    	"prefix": "8Q",
    	"country": "Maldives",
			"code": "MV"
    }, {
    	"prefix": "8R",
    	"country": "Guyana",
			"code": "GY"
    }, {
    	"prefix": "8S",
    	"country": "Sweden",
			"code": "SE"
    }, {
    	"prefix": "8T-8Y",
    	"country": "India",
			"code": "IN"
    }, {
    	"prefix": "8Z",
    	"country": "Saudi Arabia",
			"code": "SA"
    }, {
    	"prefix": "9A",
    	"country": "Croatia",
			"code": "HR"
    }, {
    	"prefix": "9B-9D",
    	"country": "Iran",
			"code": "IR"
    }, {
    	"prefix": "9E-9F",
    	"country": "Ethiopia",
			"code": "ET"
    }, {
    	"prefix": "9G",
    	"country": "Ghana",
			"code": "GH"
    }, {
    	"prefix": "9H",
    	"country": "Malta",
			"code": "MT"
    }, {
    	"prefix": "9I-9J",
    	"country": "Zambia",
			"code": "ZM"
    }, {
    	"prefix": "9K",
    	"country": "Kuwait",
			"code": "KW"
    }, {
    	"prefix": "9L",
    	"country": "Sierra Leone",
			"code": "SL"
    }, {
    	"prefix": "9M",
    	"country": "Malaysia",
			"code": "MY"
    }, {
    	"prefix": "9N",
    	"country": "Nepal",
			"code": "NP"
    }, {
    	"prefix": "9O-9T",
    	"country": "Democratic Republic of the Congo",
			"code": "CD"
    }, {
    	"prefix": "9U",
    	"country": "Burundi",
			"code": "BI"
    }, {
    	"prefix": "9V",
    	"country": "Singapore",
			"code": "SG"
    }, {
    	"prefix": "9W",
    	"country": "Malaysia",
			"code": "MY"
    }, {
    	"prefix": "9X",
    	"country": "Rwanda",
			"code": "RW"
    }, {
    	"prefix": "9Y-9Z",
    	"country": "Trinidad and Tobago",
			"code": "TT"
    }
];
