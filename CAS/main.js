function isComma(ch) {
    return (ch === ",");
}

function isDecimal(ch) {
    return (ch === ".");
}

function isDigit(ch) {
    return /\d/.test(ch);
}

function isLetter(ch) {
    return /[a-z]/i.test(ch);
}

function isOperator(ch) {
    return /[+\-*\/^]/.test(ch);
}

function isLeftParenthesis(ch) {
    return (ch === "(");
}

function isRightParenthesis(ch) {
    return (ch === ")");
}

function Token(type, value) {
    this.type = type;
    this.value = value
}

/*var tokens = tokenize("lnx*sinx8.9sin(45) + 2.2x/7");
tokens.forEach(function(token, index) {  console.log(index + " => " + token.type + "(" + token.value + ")")});*/

let refs = [//sorted by length
    ["asinh", Math.asinh],
    ["acosh", Math.acosh],
    ["atanh", Math.atanh],
    ["log10", Math.log10],
    ["floor", Math.floor],
    ["round", Math.round],
    ["trunc", Math.trunc],
    ["theta", "theta"],
    ["ceil", Math.ceil],
    ["asin", Math.asin],
    ["acos", Math.acos],
    ["atan", Math.atan],
    ["sinh", Math.sinh],
    ["cosh", Math.cosh],
    ["tanh", Math.tanh],
    ["sqrt", Math.sqrt],
    ["abs", Math.abs],
    ["exp", Math.exp],
    ["sin", Math.sin],
    ["cos", Math.cos],
    ["tan", Math.tan],
    ["log", Math.log],
    ["ln", Math.log],
    ["lg", Math.log10],
    ["pi", Math.PI],
    ["e", Math.E]
];

function tokenize(str) {
    var result = [new Token("Left Parenthesis", "(")]; //array of tokens
    // remove spaces; remember they don't matter?
    str.replace(/\s+/g, "");
    // convert to array of characters
    str = str.split("");

    let buffer = "";

    STREAM: for (let i = 0; i < str.length; i++) {
        let char = str[i];
        //console.log(buffer)
        if (char === "-") {
            if (i === 0 || isOperator(str[i - 1])) {
                result.push(new Token("Literal", "-1"));
                result.push(new Token("Operator", "*"));
            }
        }
        else if (isDigit(char) || isDecimal(char)) {
            buffer = "";
            if (isDecimal(char)) buffer += 0;
            while (isDigit(char) || isDecimal(char)) {
                buffer += (char);
                i++;
                char = str[i];
                if (i >= str.length) {
                    break;
                }
            }
            i--;
            result.push(new Token("Literal", buffer));
        }
        else if (isLetter(char)) {
            buffer = "";
            while (isLetter(char)) {
                buffer += char;
                i++;
                char = str[i];
                if (i >= str.length)
                    break;
            }
            i--;
            buffer = buffer.toLowerCase();
            for (let k = 0; k < refs.length; k++) {
                let ref = refs[k];
                if (buffer.toLowerCase() === ref[0]) {
                    result.push(new Token("Function", ref[0]));
                    continue STREAM;
                }
            }
            IND: while (buffer.length) {
                REF: for (let k = 0; k < refs.length; k++) {
                    let ref = refs[k];
                    for (let j = 0; j < ref[0].length; j++) {
                        if (buffer[j] !== ref[0][j])
                            continue REF;
                    }
                    result.push(new Token("Function", ref[0]));
                    buffer = buffer.replace(ref[0], "");
                    continue IND;
                }
                result.push(new Token("Variable", buffer[0]));
                buffer = buffer.substring(1);
            }
        }
        else if (isOperator(char)) {
            //if (char === "+" || char === "-") {

            //}
            if (char !== "/") {
                result.push(new Token("Right Parenthesis", ")"));
            }
            result.push(new Token("Operator", char));
            //if (char === "+" || char === "-") {
            if (char !== "/") {
                result.push(new Token("Left Parenthesis", "("));
            }
            //}
        }
        else if (isLeftParenthesis(char)) {
            result.push(new Token("Left Parenthesis", char));
            result.push(new Token("Left Parenthesis", char));
        }
        else if (isRightParenthesis(char)) {
            result.push(new Token("Right Parenthesis", char));
            result.push(new Token("Right Parenthesis", char));
        }
        else if (isComma(char)) {
            result.push(new Token("Function Argument Separator", char));
        }

    }

    let parenthbuffer = 0;
    for (let i = 0; i < result.length - 1; i++) {
        if (result[i].type === "Function" && (result[i + 1].type === "Variable" || result[i + 1].type === "Literal")) {
            result.splice(i + 1, 0, new Token("Left Parenthesis", "("));
            result.splice(i + 3, 0, new Token("Right Parenthesis", ")"));
            if (parenthbuffer > 0) {
                parenthbuffer--;
                result.splice(i + 3, 0, new Token("Right Parenthesis", ")"));
            }
        }
        if ((result[i].type === "Literal" || result[i].type === "Right Parenthesis") && (result[i + 1].type !== "Operator" && result[i + 1].type !== "Right Parenthesis")) {
            result.splice(i + 1, 0, new Token("Operator", "*"));
        }
        if (result[i].type === "Function" && result[i + 1].type === "Function") {
            result.splice(i + 1, 0, new Token("Left Parenthesis", "("));
            parenthbuffer++;
        }
    }
    while (parenthbuffer > 0) {
        result.push(new Token("Right Parenthesis", ")"));
        parenthbuffer--;
    }
    result.push(new Token("Right Parenthesis", ")"));

    return result;
}

let assoc = {"^": "right", "*": "left", "/": "left", "+": "left", "-": "left"};
let prec = {"^": 4, "*": 3, "/": 3, "+": 2, "-": 2};

function RPN(result) {
    let stack = [];
    let output = [];
    for (let i = 0; i < result.length; i++) {
        let t = result[i];
        if (t.type === "Literal" || t.type === "Variable") {
            output.push(t);
        }
        else if (t.type === "Function") {
            stack.push(t);
        }
        else if (t.type === "Function Argument Separator") {
            while (stack.length) {
                output.push(stack.pop());
            }
        }
        else if (t.type === "Operator") {
            while (stack.length && stack[stack.length - 1].type !== "Left Parenthesis" && (stack[stack.length - 1].type === "Function" || ((assoc[t.value] === "left" && prec[t.value] <= prec[stack[stack.length - 1].value]) || (assoc[t.value] === "right" && prec[t.value] < prec[stack[stack.length - 1].value])))) {
                output.push(stack.pop());
            }
            stack.push(t);
        }
        else if (t.type === "Left Parenthesis") {
            stack.push(t);
        }
        else if (t.type === "Right Parenthesis") {
            while (stack.length && stack[stack.length - 1].type !== "Left Parenthesis") {
                output.push(stack.pop());
            }
            if (stack.length) {
                stack.pop();
            }
        }
    }
    while (stack.length) {
        output.push(stack.pop());
    }
    console.log(output);
}

const treeData = {
    "name": "+",
    "value": 15,
    "type": "black",
    "level": "yellow",
    "children": [
        {
            "name": "X",
            "value": 10,
            "type": "grey",
            "level": "red"
        },
        {
            "name": "*",
            "value": 10,
            "type": "grey",
            "level": "red",
            "children": [
                {
                    "name": "X",
                    "value": 7.5,
                    "type": "grey",
                    "level": "purple"
                },
                {
                    "name": "Y",
                    "value": 7.5,
                    "type": "grey",
                    "level": "purple"
                }
            ]
        },
        {
            "name": "Y",
            "value": 10,
            "type": "grey",
            "level": "blue"
        },
        {
            "name": "ln",
            "value": 10,
            "type": "grey",
            "level": "green",
            "children": [
                {
                    "name": "5",
                    "value": 7.5,
                    "type": "grey",
                    "level": "orange"
                }
            ]
        },
        {
            "name": "Z",
            "value": 10,
            "type": "grey",
            "level": "green"
        }
    ]
};

// set the dimensions and margins of the diagram
const margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 660 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// declares a tree layout and assigns the size
const treemap = d3.tree().size([height, width]);

//  assigns the data to a hierarchy using parent-child relationships
let root = d3.hierarchy(treeData, d => d.children);

// maps the node data to the tree layout
root = treemap(root);

// append the svg object to the body of the page
// appends a 'group' element to 'svg'
// moves the 'group' element to the top left margin
const svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom),
    g = svg.append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

// adds the links between the nodes
const link = g.append("g")
    .attr("fill", "none")
    .attr("stroke", "#555")
    .attr("stroke-opacity", 0.4)
    .attr("stroke-width", 1.5)
    .selectAll("path")
    .data(root.links())
    .join("path")
    .attr("d", d3.linkVertical()
        .y(d => d.y / 3)
        .x(d => d.x));

// adds each node as a group
const node = g.append("g")
    .attr("stroke-linejoin", "round")
    .attr("stroke-width", 3)
    .selectAll("g")
    .data(root.descendants())
    .join("g")
    .attr("transform", d => `translate(${d.x},${d.y / 3})`);

// adds the circle to the node
node.append("circle")
    .attr("fill", d => d.children ? "#555" : "#999")
    .attr("r", 20);

// adds the text to the node
node.append("text")
    .attr("dy", "0.31em")
    .attr("text-anchor", "middle")
    .text(d => d.data.name)
    .clone(true).lower()
    .attr("stroke", "white");
