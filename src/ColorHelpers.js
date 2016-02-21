/**
 * Created by grahamcapham on 21/02/2016.
 */

ColorHelpers = {
    componentToHex:function(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    },

    rgbToZeroX:function(r, g, b) {
        return "0x" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    rgbToHex:function(r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    hexToRGB:function(h) {
        var R = hexToR(h),
        G = hexToG(h),
        B = hexToB(h);

        function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
        function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
        function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
        function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
        return "rgb("+ R+","+G+","+B+")";
    },

    rgbToRGB:function(r, g, b) {
        return "rgb(" + String(r) +","+ String(g)+"," + String(b)+")";
    }

};

module.exports = ColorHelpers;