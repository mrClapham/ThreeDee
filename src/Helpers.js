Helpers = {
    checkNumberValid:function(value){
        if(isNaN(parseFloat(value))){
            throw new Error("The value you passed should be a number")
        }else{
            return parseFloat(value);
        }
    },
    chekDomElementIsValid:function(d){
        return typeof d.innerHTML && typeof d.innerHTML === "string" ? true : false;
    }
};

module.exports = Helpers