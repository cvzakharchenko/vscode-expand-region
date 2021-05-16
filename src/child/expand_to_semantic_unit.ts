import { IResultSelection, getResult, trim } from '../baseexpander';
export function expand_to_semantic_unit(text: string, startIndex: number, endIndex: number): IResultSelection {
    const symbols = "([{)]}\""
    const breakSymbols = ",;=&|+"
    const lookBackBreakSymbols = breakSymbols + "([{"
    const lookForwardBreakSymbols = breakSymbols + ")]}"
    const counterparts = {
        "(": ")",
        "{": "}",
        "[": "]",
        ")": "(",
        "}": "{",
        "\"": "\"",
        "]": "["
    }
    let symbolStack = []

    let searchIndex = startIndex - 1;
    let newStartIndex: number, newEndIndex: number;
    while (true) {
        if (searchIndex < 0) {
            newStartIndex = searchIndex + 1
            break
        }
        let char = text[searchIndex]
        if (symbolStack.length == 0 && lookBackBreakSymbols.indexOf(char) != -1) {
            newStartIndex = searchIndex + 1
            break
        }
        if (symbols.indexOf(char) != -1) {
            if (symbolStack.length > 0 && symbolStack[symbolStack.length - 1] == counterparts[char]) {
                symbolStack.pop()
            }
            else {
                symbolStack.push(char)
            }
        }
        searchIndex -= 1
    }
    searchIndex = endIndex;
    while (true) {
        if (searchIndex == text.length) {
            return null // TODO(CVZ)
        }
        let char = text[searchIndex]
        if (symbolStack.length == 0 && lookForwardBreakSymbols.indexOf(char) != -1) {
            newEndIndex = searchIndex;
            break
        }
        if (symbols.indexOf(char) != -1) {
            if (symbolStack.length > 0 && symbolStack[symbolStack.length - 1] == counterparts[char]) {
                symbolStack.pop()
            }
            else {
                symbolStack.push(char)
            }
        }
        searchIndex += 1
    }
    let s = text.substring(newStartIndex, newEndIndex);
    let trimResult = trim(s);
    if (trimResult) {
        newStartIndex = newStartIndex + trimResult.start
        newEndIndex = newEndIndex - (s.length - trimResult.end);
    }
    if (newStartIndex == startIndex && newEndIndex == endIndex) return null;
    if (newStartIndex > startIndex || newEndIndex < endIndex) return null;
    return getResult(newStartIndex, newEndIndex, text, "semantic_unit");
    // return null;
}
