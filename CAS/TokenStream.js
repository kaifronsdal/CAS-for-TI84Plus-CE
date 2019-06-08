function TokenStream(str) {
    this.str = str;
    this.numberbuffer = [];
    this.letterbuffer = [];

    // remove spaces; remember they don't matter?
    this.str.replace(/\s+/g, "");
    // convert to array of characters
    this.str = str.split("");
}

str.forEach(function (char) {
    if (isDigit(char)) {
        numberbuffer.push(char)
        //result.push(new Token("Literal", char));
    } else if (isDecimal(char)) {
        numberbuffer.push(char)
        //result.push(new Token("Decimal", char));
    } else if (isLetter(char)) {
        numberbuffer.push(char)
        letterbuffer.push(char)
        result.push(new Token("Variable", char));
    } else if (isOperator(char)) {
        result.push(new Token("Operator", char));
    } else if (isLeftParenthesis(char)) {
        result.push(new Token("Left Parenthesis", char));
    } else if (isRightParenthesis(char)) {
        result.push(new Token("Right Parenthesis", char));
    } else if (isComma(char)) {
        result.push(new Token("Function Argument Separator", char));
    }
});
TokenStream.prototype.