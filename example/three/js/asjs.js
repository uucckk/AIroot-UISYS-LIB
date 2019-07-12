/**
 * @author sunxy
 * @email	uucckk@163.com
 * @version 0.9.1
 * http://www.airoot.cn/
 * @modify date '2016-04-07';
 */


/*
 * DO NOT REMOVE THIS NOTICE
 *
 * PROJECT:   JsDecoder
 * VERSION:   1.1.0
 * COPYRIGHT: (c) 2004-2008 Cezary Tomczak
 * LINK:      http://code.gosu.pl
 * LICENSE:   GPL
 */

function JsDecoder()
{
    this.s = '';
    this.len = 0;
    
    this.i = 0;
    this.lvl = 0; /* indent level */
    this.code = [''];
    this.row = 0;
    this.switches = [];

    this.lastWord = '';
    this.nextChar = '';
    this.prevChar = '';
    this.isAssign = false;

    this.decode = function ()
    {
        this.s = this.s.replace(/[\r\n\f]+/g, "\n");
        this.len = this.s.length;
        while (this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            this.charInit();
            this.switch_c(c);
            this.i++;
        }
        return this.code.join("\n");
    };
    this.switch_c = function(c)
    {
        switch (c)
        {
            case "\n":
                this.linefeed(); 
                break;

            case ' ':
            case "\t":
                this.space();
                break;

            case '{':  this.blockBracketOn();  break;
            case '}':  this.blockBracketOff(); break;

            case ':':  this.colon();     break;
            case ';':  this.semicolon(); break;

            case '(':  this.bracketOn();        break;
            case ')':  this.bracketOff();       break;
            case '[':  this.squareBracketOn();  break;
            case ']':  this.squareBracketOff(); break;

            case '"':
            case "'":
                this.quotation(c);
                break;

            case '/':
                if ('/' == this.nextChar) {
                    this.lineComment();
                } else if ('*' == this.nextChar) {
                    this.comment();
                } else {
                    this.slash();
                }
                break;

            case ',':  this.comma(); break;
            case '.':  this.dot(); break;

            case '~':
            case '^':
                this.symbol1(c);
                break;

            case '-': case '+': case '*': case '%':
            case '<': case '=': case '>': case '?':
            case ':': case '&': case '|': case '/':
                this.symbol2(c);
                break;

            case '!':
                if ('=' == this.nextChar) {
                    this.symbol2(c);
                } else {
                    this.symbol1(c);
                }
                break;

            default:
                if (/\w/.test(c)) { this.alphanumeric(c); }
                else { this.unknown(c); }
                break;
        }
        c = this.s.charAt(this.i);
        if (!/\w/.test(c)) {
            this.lastWord = '';
        }
    };
    this.blockBracketOn = function ()
    {
        this.isAssign = false;
        var nextNW = this.nextNonWhite(this.i);
        if ('}' == nextNW) {
            var ss = (this.prevChar == ')' ? ' ' : '');
            this.write(ss+'{');
            this.lvl++;
            return;
            
        }
        if (/^\s*switch\s/.test(this.getCurrentLine())) {
            this.switches.push(this.lvl);
        }
        var line = this.getCurrentLine();
        var line_row = this.row;
        var re = /(,)\s*(\w+\s*:\s*function\s*\([^\)]*\)\s*)$/;
        if (re.test(line)) {
            this.replaceLine(this.code[line_row].replace(re, '$1'));
            this.writeLine();
            var match = re.exec(line);
            this.write(match[2]);
        }

        /* example: return {
            title: 'Jack Slocum',
            iconCls: 'user'}
            After return bracket cannot be on another line
        */
        if (/^\s*return\s*/.test(this.code[this.row])) {
            if (/^\s*return\s+\w+/.test(this.code[this.row])) {
                this.writeLine();
            } else if (this.prevChar != ' ') {
                this.write(' ');
            }
            this.write('{');
            this.writeLine();
            this.lvl++;
            return;
        }

        if (/function\s*/.test(this.code[this.row]) || this.isBlockBig()) {
            this.writeLine();
        } else {
            if (this.prevChar != ' ' && this.prevChar != "\n" && this.prevChar != '(') {
                /*  && this.prevChar != '(' && this.prevChar != '[' */
                this.write(' ');
            }
        }
        this.write('{');
        this.lvl++;
        if ('{' != nextNW) {
            this.writeLine();
        }
    };
    this.isBlockBig = function()
    {
        var i = this.i + 1;
        var count = 0;
        var opened = 0;
        var closed = 0;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (/\s/.test(c)) {
                continue;
            }
            if ('}' == c && opened == closed) {
                break;
            }
            if ('{' == c) { opened++; }
            if ('}' == c) { closed++; }
            count++;
            if (count > 80) {
                return true;
            }
        }
        return (count > 80);
    };
    this.blockBracketOff = function ()
    {
        var nextNW = this.nextNonWhite(this.i);
        var prevNW = this.prevNonWhite(this.i);
        var line = this.getCurrentLine();

        if (prevNW != '{')
        {
            if (line.length && nextNW != ';' && nextNW != '}' && nextNW != ')' && nextNW != ',') {
                //this.semicolon();
                this.writeLine();
            } else if (line.length && prevNW != ';' && nextNW == '}' && this.isAssign) {
                this.semicolon();
            } else if (line.length && this.isAssign && prevNW != ';') {
                this.semicolon();
            } else if (line.length && prevNW != ';') {
                if (/^\s*(else)?\s*return[\s(]+/i.test(line)) {
                    this.semicolon();
                } else {
                    this.writeLine();
                }
            }
        }
        this.write('}');

        if (',' == nextNW) {
            this.write(',');
            this.goNextNonWhite();
        }
        var next3 = this.nextManyNW(3);
        if (next3 == '(),') {
            this.write('(),');
            this.goNextManyNW('(),');
            this.writeLine();
        }
        else if (next3 == '();') {
            this.write('();');
            this.goNextManyNW('();');
            this.writeLine();
        }
        else if (next3 == '():') {
            this.write('()');
            this.goNextManyNW('()');
            this.write(' : ');
            this.goNextNonWhite();
        }
        else
        {
            if ('{' == prevNW) {
                if (',' == nextNW && this.getCurrentLine().length < 80) {
                    this.write(' ');
                } else {
                    if (this.nextWord() || '}' == nextNW) {
                        this.writeLine();
                    }
                }
            } else {
                if (')' != nextNW && ']' != nextNW) {
                    if (',' == nextNW && /^[\s\w,]+\)/.test(this.s.substr(this.i, 20))) {
                        this.write(' ');
                    } else {
                        this.writeLine();
                    }
                }
            }
        }
        this.lvl--;

        if (this.switches.length && this.switches[this.switches.length - 1] == this.lvl)
        {
            var row = this.row - 1;
            var spaces1 = str_repeat(' ', this.lvl * 4);
            var spaces2 = str_repeat(' ', (this.lvl + 1) * 4);
            var sw1 = new RegExp('^'+spaces1+'(switch\\s|{)');
            var sw2 = new RegExp('^'+spaces2+'(case|default)[\\s:]');
            var sw3 = new RegExp('^'+spaces2+'[^\\s]');
            while (row > 0) {
                row--;
                if (sw1.test(this.code[row])) {
                    break;
                }
                if (sw2.test(this.code[row])) {
                    continue;
                }
                this.replaceLine('    ' + this.code[row], row);
                /*
                if (sw3.test(this.code[row])) {
                    this.replaceLine('    ' + this.code[row], row);
                }
                */
            }
            this.switches.pop();
        }

        // fix missing brackets for sub blocks

        if (this.sub) {
            return;
        }

        var re1 = /^(\s*else\s*if)\s*\(/;
        var re2 = /^(\s*else)\s+[^{]+/;

        var part = this.s.substr(this.i+1, 100);
        
        if (re1.test(part)) {
            this.i += re1.exec(part)[1].length;
            this.write('else if');
            this.lastWord = 'if';
            //debug(this.getCurrentLine(), 're1');
            this.fixSub('else if');
            //debug(this.getCurrentLine(), 're1 after');
        } else if (re2.test(part)) {
            this.i += re2.exec(part)[1].length;
            this.write('else');
            this.lastWord = 'else';
            //debug(this.getCurrentLine(), 're2');
            this.fixSub('else');
            //debug(this.getCurrentLine(), 're2 after');
        }
    };
    this.bracketOn = function ()
    {
        if (this.isKeyword() && this.prevChar != ' ' && this.prevChar != "\n") {
            this.write(' (');
        } else {
            this.write('(');
        }
    };
    this.bracketOff = function ()
    {
        this.write(')');
        /*
        if (/\w/.test(this.nextNonWhite(this.i))) {
            this.semicolon();
        }
        */
        if (this.sub) {
            return;
        }
        var re = new RegExp('^\\s*(if|for|while|do)\\s*\\([^{}]+\\)$', 'i');
        var line = this.getCurrentLine();
        if (re.test(line)) {
            var c = this.nextNonWhite(this.i);
            if ('{' != c && ';' != c && ')' != c) {
                var opened = 0;
                var closed = 0;
                var foundFirst = false;
                var semicolon = false;
                var fix = false;
                for (var k = 0; k < line.length; k++) {
                    if (line.charAt(k) == '(') {
                        foundFirst = true;
                        opened++;
                    }
                    if (line.charAt(k) == ')') {
                        closed++;
                        if (foundFirst && opened == closed) {
                            if (k == line.length - 1) {
                                fix = true;
                            } else {
                                break;
                            }
                        }
                    }
                }
                if (fix) {
                    //alert(this.s.substr(this.i));
                    //throw 'asdas';
                    //alert(line);
                    this.fixSub(re.exec(line)[1]);
                    /*
                    this.writeLine();
                    this.lvl2++;
                    var indent = '';
                    for (var j = 0; j < this.lvl2; j++) {
                        indent += '    ';
                    }
                    this.write(indent);
                    */
                }
            }
        }
    };
    this.sub = false;
    
    this.orig_i = null;
    this.orig_lvl = null;
    this.orig_code = null;
    this.orig_row = null;
    this.orig_switches = null;

    this.restoreOrig = function (omit_i)
    {
        this.sub = false;
        
        if (!omit_i) { this.i = this.orig_i; }
        this.lvl = this.orig_lvl;
        this.code = this.orig_code;
        this.row = this.orig_row;
        this.switches = this.orig_switches;

        this.prevCharInit();
        
        this.lastWord = '';
        this.charInit();
        this.isAssign = false;
    };
    this.combineSub = function ()
    {
        //debug(this.orig_code, 'orig_code');
        for (i = 0; i < this.code.length; i++) {
            var line = this.orig_code[this.orig_row];
            if (0 == i && line.length) {
                if (line.substr(line.length-1, 1) != ' ') {
                    this.orig_code[this.orig_row] += ' ';
                }
                this.orig_code[this.orig_row] += this.code[i].trim();
            } else {
                this.orig_code[this.orig_row+i] = this.code[i];
            }
        }
        //debug(this.code, 'sub_code');
        //debug(this.orig_code, 'code');
    };
    this.fixSub = function (keyword)
    {
        // repair missing {}: for, if, while, do, else, else if

        if (this.sub) {
            return;
        }

        if ('{' == this.nextNonWhite(this.i)) {
            return;
        }

        var firstWord = this.nextWord();

        //debug(this.code, 'fixSub('+keyword+') start');

        this.orig_i = this.i;
        this.orig_lvl = this.lvl;
        this.orig_code = this.code;
        this.orig_row = this.row;
        this.orig_switches = this.switches;
        
        this.sub = true;
        this.code = [''];
        this.prevChar = '';
        this.row = 0;
        this.switches = [];
        this.isAssign = false;

        this.i++;

        var b1 = 0;
        var b2 = 0;
        var b3 = 0;

        if ('else if' == keyword) {
            var first_b2_closed = false;
        }

        var found = false;

        var b1_lastWord = false;
        var b2_lastWord = false;

        while (!found && this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            this.charInit();
            switch (c)
            {
                case '{': b1++; break;
                case '}':
                    b1--;
                    // case: for(){if (!c.m(g))c.g(f, n[t] + g + ';')}
                    if (0 == b1 && 0 == b2 && 0 == b3 && this.lvl-1 == this.orig_lvl)
                    {
                        var nextWord = this.nextWord();
                        if ('switch' == firstWord) {
                            found = true;
                            break;
                        }
                        if ('try' == firstWord && 'catch' == b1_lastWord) {
                            found = true;
                            break;
                        }
                        if ('while' == firstWord && 'do' == b1_lastWord) {
                            found = true;
                            break;
                        }
                        if ('if' == firstWord) {
                            // todo
                        }
                        if ('if' == keyword && 'else' == nextWord && 'if' != firstWord) {
                            found = true;
                            break;
                        }
                        b1_lastWord = nextWord;
                    }
                    break;
                case '(': b2++; break;
                case ')':
                    b2--;
                    if ('else if' == keyword && 0 == b2 && !first_b2_closed) {
                        if (this.nextNonWhite(this.i) == '{') {
                            this.write(c);
                            this.combineSub();
                            this.restoreOrig(true);
                            //debug(this.code, 'fixSub('+keyword+') b2 return');
                            //debug(this.s.charAt(this.i), ' b2 current char');
                            return;
                        }
                        // do not restore orig i
                        this.write(c);
                        this.combineSub();
                        this.restoreOrig(true);
                        this.fixSub('if');
                        //debug(this.code, 'fixSub('+keyword+') b2 return');
                        return;
                    }
                    break;
                case '[': b3++; break;
                case ']': b3--; break;
                case ';':
                    //debug(this.getCurrentLine(), 'semicolon');
                    //debug([b1, b2, b3]);
                    if (0 == b1 && 0 == b2 && 0 == b3 && this.lvl == this.orig_lvl && 'if' != firstWord) {
                        found = true;
                    }
                    break;
            }
            if (-1 == b1 && b2 == 0 && b3 == 0 && this.prevNonWhite(this.i) != '}') {
                this.write(';');
                this.i--;
                found = true;
            } else if (b1 < 0 || b2 < 0 || b3 < 0) {
                found = false;
                break;
            } else {
                this.switch_c(c);
            }
            this.i++;
        }
        this.i--;

        if (found)
        {
            /*
            var re = /^\s*(else\s+[\s\S]*)$/;
            if ('if' == keyword && re.test(this.getCurrentLine())) {
                this.i = this.i - re.exec(this.getCurrentLine())[1].length;
                this.code[this.row] = '';
            }
            */
            this.s = this.s.substr(0, this.orig_i+1) + '{' + this.code.join("\n") + '}' + this.s.substr(this.i+1);
            this.len = this.s.length;
        }

        //debug("{\n" + this.code.join("\n") + '}', 'fixSub('+keyword+') result');
        //debug(found, 'found');

        this.restoreOrig(false);
    };
    this.squareBracketOn = function ()
    {
        this.checkKeyword();
        this.write('[');
    };
    this.squareBracketOff = function ()
    {
        this.write(']');
    };
    this.isKeyword = function ()
    {
        // Check if this.lastWord is a keyword
        return this.lastWord.length && this.keywords.indexOf(this.lastWord) != -1;
    };
    this.linefeed = function () {};
    this.space = function ()
    {
        if (!this.prevChar.length) {
            return;
        }
        if (' ' == this.prevChar || "\n" == this.prevChar) {
            return;
        }
        if ('}' == this.prevChar && ']' == this.nextChar) {
            //return;
        }
        this.write(' ');
        return;
        
        /*
        if (this.isKeyword()) {
            this.write(' ');
            this.lastWord = '';
        } else {
            var multi = ['in', 'new'];
            for (var i = 0; i < multi.length; i++) {
                var isKeywordNext = true;
                for (var j = 0; j < multi[i].length; j++) {
                    if (multi[i][j] != this.s.charAt(this.i + 1 + j)) {
                        isKeywordNext = false;
                        break;
                    }
                }
                if (isKeywordNext) {
                    this.write(' ');
                    this.lastWord = '';
                    break;
                }
            }
        }
        */
    };
    this.checkKeyword = function ()
    {
        if (this.isKeyword() && this.prevChar != ' ' && this.prevChar != "\n") {
            this.write(' ');
        }
    };
    this.nextWord = function ()
    {
        var i = this.i;
        var word = '';
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (word.length) {
                if (/\s/.test(c)) {
                    break;
                } else if (/\w/.test(c)) {
                    word += c;
                } else {
                    break;
                }
            } else {
                if (/\s/.test(c)) {
                    continue;
                } else if (/\w/.test(c)) {
                    word += c;
                } else {
                    break;
                }
            }
        }
        if (word.length) {
            return word;
        }
        return false;
    };
    this.nextManyNW = function(many)
    {
        var ret = '';
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                ret += c;
                if (ret.length == many) {
                    return ret;
                }
            }
        }
        return false;
    }
    this.goNextManyNW = function (cc)
    {
        var ret = '';
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                ret += c;
                if (ret == cc) {
                    this.i = i;
                    this.charInit();
                    return true;
                }
                if (ret.length >= cc.length) {
                    return false;
                }
            }
        }
        return false;
    };
    this.nextNonWhite = function (i)
    {
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                return c;
            }
        }
        return false;
    };
    this.prevNonWhite = function (i)
    {
        while (i > 0)
        {
            i--;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                return c;
            }
        }
        return false;
    };
    this.goNextNonWhite = function ()
    {
        // you need to write() this nonWhite char when calling this func
        var i = this.i;
        while (i < this.len - 1)
        {
            i++;
            var c = this.s.charAt(i);
            if (!/^\s+$/.test(c)) {
                this.i = i;
                this.charInit();
                return true;
            }
        }
        return false;
    };
    this.colon = function ()
    {
        //alert(this.getCurrentLine());
        /* case 6: expr ? stat : stat */
        var line = this.getCurrentLine();
        if (/^\s*case\s/.test(line) || /^\s*default$/.test(line)) {
            this.write(':');
            this.writeLine();
        } else {
            this.symbol2(':');
        }
    };
    this.isStart = function ()
    {
        return this.getCurrentLine().length === 0;
    };
    this.backLine = function ()
    {
        if (!this.isStart) {
            throw 'backLine() may be called only at the start of the line';
        }
        this.code.length = this.code.length-1;
        this.row--;
    };
    this.semicolon = function ()
    {
        /* for statement: for (i = 1; i < len; i++) */
        this.isAssign = false;
        if (this.isStart()) {
            this.backLine();
        }
        this.write(';');
        if (/^\s*for\s/.test(this.getCurrentLine())) {
            this.write(' ');
        } else {
            this.writeLine();
        }
    };
    this.quotation = function (quotation)
    {
        this.checkKeyword();
        var escaped = false;
        this.write(quotation);
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ('\\' == c) {
                escaped = (escaped ? false : true);
            }
            this.write(c);
            if (c == quotation) {
                if (!escaped) {
                    break;
                }
            }
            if ('\\' != c) {
                escaped = false;
            }
        }
        //debug(this.getCurrentLine(), 'quotation');
        //debug(this.s.charAt(this.i), 'char');
    };
    this.lineComment = function ()
    {
        this.write('//');
        this.i++;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ("\n" == c) {
                this.writeLine();
                break;
            }
            this.write(c);
        }
    };
    this.comment = function ()
    {
        this.write('/*');
        this.i++;
        var c = '';
        var prevC = '';
        while (this.i < this.len - 1)
        {
            this.i++;
            prevC = c;
            c = this.s.charAt(this.i);
            if (' ' == c || "\t" == c || "\n" == c) {
                if (' ' == c) {
                    if (this.getCurrentLine().length > 100) {
                        this.writeLine();
                    } else {
                        this.write(' ', true);
                    }
                } else if ("\t" == c) {
                    this.write('    ', true);
                } else if ("\n" == c) {
                    this.writeLine();
                }
            } else {
                this.write(c, true);
            }
            if ('/' == c && '*' == prevC) {
                break;
            }
        }
        this.writeLine();
    };
    this.slash = function ()
    {
        /*
        divisor /= or *\/ (4/5 , a/5)
        regexp /\w/ (//.test() , var asd = /some/;)
        asd /= 5;
        bbb = * / (4/5)
        asd =( a/5);
        regexp = /\w/;
        /a/.test();
        var asd = /some/;
        obj = { sasd : /pattern/ig }
        */
        var a_i = this.i - 1;
        var a_c = this.s.charAt(a_i);
        for (a_i = this.i - 1; a_i >= 0; a_i--) {
            var c2 = this.s.charAt(a_i);
            if (' ' == c2 || '\t' == c2) {
                continue;
            }
            a_c = this.s.charAt(a_i);
            break;
        }
        var a = /^\w+$/.test(a_c) || ']' == a_c || ')' == a_c;
        var b = ('*' == this.prevChar);
        if (a || b) {
            if (a) {
                if ('=' == this.nextChar) {
                    var ss = this.prevChar == ' ' ? '' : ' ';
                    this.write(ss+'/');
                } else {
                    this.write(' / ');
                }
            } else if (b) {
                this.write('/ ');
            }
        } else if (')' == this.prevChar) {
            this.write(' / ');
        } else {
            var ret = '';
            if ('=' == this.prevChar || ':' == this.prevChar) {
                ret += ' /';
            } else {
                ret += '/';
            }
            var escaped = false;
            while (this.i < this.len - 1) {
                this.i++;
                var c = this.s.charAt(this.i);
                if ('\\' == c) {
                    escaped = (escaped ? false : true);
                }
                ret += c;
                if ('/' == c) {
                    if (!escaped) {
                        break;
                    }
                }
                if ('\\' != c) {
                    escaped = false;
                }
            }
            this.write(ret);
        }
    };
    this.comma = function ()
    {
        /*
         * function arguments seperator
         * array values seperator
         * object values seperator
         */
        this.write(', ');
        var line = this.getCurrentLine();
        if (line.replace(' ', '').length > 100) {
            this.writeLine();
        }
    };
    this.dot = function ()
    {
        this.write('.');
    };
    this.symbol1 = function (c)
    {
        if ('=' == this.prevChar && '!' == c) {
            this.write(' '+c);
        } else {
            this.write(c);
        }
    };
    this.symbol2 = function (c)
    {
        // && !p
        // ===
        if ('+' == c || '-' == c) {
            if (c == this.nextChar || c == this.prevChar) {
                this.write(c);
                return;
            }
        }
        var ss = (this.prevChar == ' ' ? '' : ' ');
        var ss2 = ' ';
        if ('(' == this.prevChar) {
            ss = '';
            ss2 = '';
        }
        if ('-' == c && ('>' == this.prevChar || '>' == this.prevChar)) {
            this.write(' '+c);
            return;
        }
        if (this.symbols2.indexOf(this.prevChar) != -1) {
            if (this.symbols2.indexOf(this.nextChar) != -1) {
                this.write(c + (this.nextChar == '!' ? ' ' : ''));
            } else {
                this.write(c + ss2);
            }
        } else {
            if (this.symbols2.indexOf(this.nextChar) != -1) {
                this.write(ss + c);
            } else {
                this.write(ss + c + ss2);
            }
        }
        if ('=' == c && /^[\w\]]$/.test(this.prevNonWhite(this.i)) && /^[\w\'\"\[]$/.test(this.nextNonWhite(this.i))) {
            this.isAssign = true;
        }
    };
    this.alphanumeric = function (c)
    {
        /* /[a-zA-Z0-9_]/ == /\w/ */
        if (this.lastWord) {
            this.lastWord += c;
        } else {
            this.lastWord = c;
        }
        if (')' == this.prevChar) {
            c = ' '+c;
        }
        this.write(c);
    };
    this.unknown = function (c)
    {
        //throw 'Unknown char: "'+c+'" , this.i = ' + this.i;
        this.write(c);
    };

    this.charInit = function ()
    {
        /*
        if (this.i > 0) {
            //this.prevChar = this.s.charAt(this.i - 1);
            var line = this.code[this.row];
            if (line.length) {
                this.prevChar = line.substr(line.length-1, 1);
            } else {
                this.prevChar = '';
            }
        } else {
            this.prevChar = '';
        }
        */
        if (this.len - 1 === this.i) {
            this.nextChar = '';
        } else {
            this.nextChar = this.s.charAt(this.i + 1);
        }
    };
    this.write = function (s, isComment)
    {
        if (isComment) {
            if (!/\s/.test(s)) {
                if (this.code[this.row].length < this.lvl * 4) {
                    this.code[this.row] += str_repeat(' ', this.lvl * 4 - this.code[this.row].length);
                }
            }
            this.code[this.row] += s;
        } else {
            if (0 === this.code[this.row].length) {
                var lvl = ('}' == s ? this.lvl - 1 : this.lvl);
                for (var i = 0; i < lvl; i++) {
                    this.code[this.row] += '    ';
                }
                    this.code[this.row] += s;
            } else {
                this.code[this.row] += s;
            }
        }
        this.prevCharInit();
    };
    this.writeLine = function ()
    {
        this.code.push('');
        this.row++;
        this.prevChar = "\n";
    };
    this.replaceLine = function (line, row)
    {
        if ('undefined' == typeof row) {
            row = false;
        }
        if (row !== false) {
            if (!/^\d+$/.test(row) || row < 0 || row > this.row) {
                throw 'replaceLine() failed: invalid row='+row;
            }
        }
        if (row !== false) {
            this.code[row] = line;
        } else {
            this.code[this.row] = line;
        }
        if (row === false || row == this.row) {
            this.prevCharInit();
        }
    };
    this.prevCharInit = function ()
    {
        this.prevChar = this.code[this.row].charAt(this.code[this.row].length - 1);
    };
    this.writeTab = function ()
    {
        this.write('    ');
        this.prevChar = ' ';
    };
    this.getCurrentLine = function ()
    {
        return this.code[this.row];
    };

    this.symbols1 = '~!^';
    this.symbols2 = '-+*%<=>?:&|/!';
    this.keywords = ['abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char', 'class',
        'const', 'continue', 'default', 'delete', 'do', 'double', 'else', 'extends', 'false',
        'final', 'finally', 'float', 'for', 'function', 'goto', 'if', 'implements', 'import',
        'in', 'instanceof', 'int', 'interface', 'long', 'native', 'new', 'null', 'package',
        'private', 'protected', 'public', 'return', 'short', 'static', 'super', 'switch',
        'synchronized', 'this', 'throw', 'throws', 'transient', 'true', 'try', 'typeof', 'var',
        'void', 'while', 'with'];
}

if (typeof Array.prototype.indexOf == 'undefined') {
    /* Finds the index of the first occurence of item in the array, or -1 if not found */
    Array.prototype.indexOf = function(item) {
        for (var i = 0; i < this.length; i++) {
            if ((typeof this[i] == typeof item) && (this[i] == item)) {
                return i;
            }
        }
        return -1;
    };
}
if (!String.prototype.trim) {
    String.prototype.trim = function() {
        return this.replace(/^\s*|\s*$/g, '');
    };
}

function str_repeat(str, repeat)
{
    ret = '';
    for (var i = 0; i < repeat; i++) {
        ret += str;
    }
    return ret;
}

var debug_w;
function debug (arr, name)
{
    if (!debug_w) 
    {
        var width = 600;
        var height = 600;
        var x = (screen.width/2-width/2);
        var y = (screen.height/2-height/2);
        debug_w = window.open('', '', 'scrollbars=yes,resizable=yes,width='+width+',height='+height+',screenX='+(x)+',screenY='+y+',left='+x+',top='+y);
        debug_w.document.open();
        debug_w.document.write('<html><head><style>body{margin: 1em;padding: 0;font-family: courier new; font-size: 12px;}h1,h2{margin: 0.2em 0;}</style></head><body><h1>Debug</h1></body></html>');
        debug_w.document.close();
    }
    var ret = '';
    if ('undefined' !== typeof name && name.length) {
        ret = '<h2>'+name+'</h2>'+"\n";
    }
    if ('object' === typeof arr) {
        for (var i = 0; i < arr.length; i++) {
            ret += '['+i+'] => '+arr[i]+"\n";
        }
    } else if ('string' == typeof arr) {
        ret += arr;
    } else {
        try { ret += arr.toString(); } catch (e) {}
        ret += ' ('+typeof arr+')';
    }
    debug_w.document.body.innerHTML += '<pre>'+ret+'</pre>';
}
/*
 * DO NOT REMOVE THIS NOTICE
 *
 * PROJECT:   JsDecoder
 * VERSION:   1.1.0
 * COPYRIGHT: (c) 2004-2008 Cezary Tomczak
 * LINK:      http://code.gosu.pl
 * LICENSE:   GPL
 */

function JsColorizer() {
    this.color = {
        "keyword":   "#9999FF",
        "object":    "#FF0000",
        "quotation": "#FF00FF",
        "comment":   "#338033"
    };

    this.s = ""; // code to colorize
    this.i = 0;
    this.len = 0;

    this.ret = ""; // colorized code
    this.lastWord = ""; // last alphanumeric word
    this.nextChar = "";
    this.prevChar = "";

    this.code = [""];
    this.row = 0;

    this.times = {
        quotation: 0, quotation_calls: 0,
        lineComment: 0, lineComment_calls: 0,
        comment: 0, comment_calls: 0,
        slash: 0, slash_calls: 0,
        word: 0, word_calls: 0
    };

    this.write = function (s)
    {
        this.code[this.row] += s;
        if (s.length == 1) {
            this.prevChar = s;
        } else {
            this.prevCharInit();
        }
    };
    this.writeLine = function ()
    {
        this.code.push("");
        this.row++;
        this.prevChar = "\n";
    };
    this.prevCharInit = function ()
    {
        this.prevChar = this.code[this.row].charAt(this.code[this.row].length - 1);
    };

    this.showTimes = function ()
    {
        var ret = '';
        for (var f in this.times) {
            var t = this.times[f];
            if (/_calls/.test(f)) {
                ret += f+': '+t+"\n";
            } else {
                ret += f+': '+time_round(t)+" sec\n";
            }
        }
        return ret;
    };

    this.colorize = function()
    {
        this.len = this.s.length;
        while (this.i < this.len)
        {
            var c = this.s.charAt(this.i);
            if (this.len - 1 == this.i) {
                this.nextChar = "";
            } else {
                this.nextChar = this.s.charAt(this.i + 1);
            }
            switch (c) {
                case "\n":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    this.writeLine();
                    break;
                case "'":
                case '"':
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    this.quotation(c);
                    break;
                case "/":
                    if (this.lastWord.length) { this.word(); }
                    this.lastWord = '';
                    if ("/" == this.nextChar) {
                        this.lineComment();
                    } else if ("*" == this.nextChar) {
                        this.comment();
                    } else {
                        this.slash();
                    }
                    break;
                default:
                    if (/^\w$/.test(c)) {
                        this.lastWord += c;
                    } else {
                        if (this.lastWord.length) { this.word(); }
                        this.lastWord = '';
                        this.write(c);
                    }
                    break;
            }
            this.i++;
        }
        this.write(this.lastWord);
        return this.code.join("\n");
    };

    this.quotation = function(quotation)
    {
        //var time = time_start();
        var s = quotation;
        var escaped = false;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            if ("\\" == c) {
                escaped = (escaped ? false : true);
            }
            s += c;
            if (c == quotation) {
                if (!escaped) {
                    break;
                }
            }
            if ("\\" != c) {
                escaped = false;
            }
        }
        this.write('<font color="'+this.color.quotation+'">' + s + '</font>');
        //this.times.quotation += time_get(time);
        //this.times.quotation_calls++;
    };

    this.lineComment = function()
    {
        //var time = time_start();
        var s = "//";
        this.i++;
        while (this.i < this.len - 1) {
            this.i++;
            var c = this.s.charAt(this.i);
            s += c;
            if ("\n" == c) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.lineComment += time_get(time);
        //this.times.lineComment_calls++;
    };

    this.comment = function()
    {
        //var time = time_start();
        var s = "/*";
        this.i++;
        var c = "";
        var prevC = "";
        while (this.i < this.len - 1) {
            this.i++;
            prevC = c;
            c = this.s.charAt(this.i);
            s += c;
            if ("/" == c && "*" == prevC) {
                break;
            }
        }
        this.write('<font color="'+this.color.comment+'">' + s + '</font>');
        //this.times.comment += time_get(time);
        //this.times.comment_calls++;
    };

    /* SLASH
     * divisor /= or *\/ (4/5 , a/5)
     * regexp /\w/ (//.test() , var asd = /some/;) */
    this.slash = function()
    {
        //var time = time_start();
        var a_i = this.i - 1;
        var a_c = this.s.charAt(a_i);
        for (a_i = this.i - 1; a_i >= 0; a_i--) {
            var c2 = this.s.charAt(a_i);
            if (" " == c2 || "\t" == c2) {
                continue;
            }
            a_c = this.s.charAt(a_i);
            break;
        }
        var a = /^\w+$/.test(a_c) || ']' == a_c || ')' == a_c;
        var b = ("*" == this.prevChar);
        if (a || b) {
            if (a) {
                if ("=" == this.nextChar) {
                    this.write("/");
                } else {
                    this.write("/");
                }
            } else if (b) {
                this.write("/");
            }
        } else if (')' == this.prevChar) {
            this.write('/');
        } else {
            var ret = '';
            if ("=" == this.prevChar) {
                ret += "/";
            } else {
                ret += "/";
            }
            var escaped = false;
            while (this.i < this.len - 1) {
                this.i++;
                var c = this.s.charAt(this.i);
                if ("\\" == c) {
                    escaped = (escaped ? false : true);
                }
                ret += c;
                if ("/" == c) {
                    if (!escaped) {
                        break;
                    }
                }
                if ("\\" != c) {
                    escaped = false;
                }
            }
            this.write('<font color="'+this.color.quotation+'">' + ret + '</font>');
        }
        //this.times.slash += time_get(time);
        //this.times.slash_calls++;
    };

    this.word = function()
    {
        //var time = time_start();
        if (this.keywords.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.keyword+'"><B>' + this.lastWord + '</B></font>');
        } else if (this.objects.indexOf(this.lastWord) != -1) {
            this.write('<font color="'+this.color.object+'">' + this.lastWord + '</font>');
        } else {
            this.write(this.lastWord);
        }
        //this.times.word += time_get(time);
        //this.times.word_calls++;
    };

    this.keywords = ["abstract", "boolean", "break", "byte", "case", "catch", "char", "class",
        "const", "continue", "default", "delete", "do", "double", "else", "extends", "false",
        "final", "finally", "float", "for", "function", "goto", "if", "implements", "import",
        "in", "instanceof", "int", "interface", "long", "native", "new", "null", "package",
        "private", "protected", "public", "return", "short", "static", "super", "switch",
        "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var",
        "void", "while", "with"];

    this.objects = ["Anchor", "anchors", "Applet", "applets", "Area", "Array", "Button", "Checkbox",
        "Date", "document", "FileUpload", "Form", "forms", "Frame", "frames", "Hidden", "history",
        "Image", "images", "Link", "links", "Area", "location", "Math", "MimeType", "mimeTypes",
        "navigator", "options", "Password", "Plugin", "plugins", "Radio", "Reset", "Select",
        "String", "Submit", "Text", "Textarea", "window"];
}


"use strict";
var _lib = new function(){
	var _method = {
		"object":"<span style='font-weight:bold;color:#aaaaaa'>Object</span>",
		"string":"<span style='font-weight:bold;color:#aaaa00'>String</span>",
		"function":"<span style='font-weight:bold;color:#aaaaff'>Function</span>",
		"boolean":"<span style='font-weight:bold;color:#aaffaa'>Boolean</span>",
		"number":"<span style='font-weight:bold;color:#ff9999'>Number</span>",
		"array":"<span style='font-weight:bold;color:#009999'>Array</span>"
	};
	this.getTypeHTML = function(obj){
		var type = typeof(obj) == 'object' ? (obj instanceof Array ? "array" : "object") : typeof(obj);
		return _method[type]? _method[type]:type;
	}
}

String.prototype.trim=function(){
	return this.replace(/(^\s*)|(\s*$)/g, "");
}

Date.prototype._METHOD_ = {
	_label:"Date 方法说明",
	"format" : {value:"设置日期显示格式.例如 format('yyyy-MM-dd') 其显示内容为：2015-09-07"},
	"offsetDate" : {value:"设置日偏移量.例如 offsetDate(+1) 表示显示当天日期的下一天"},
	"offsetMonth" : {value:"设置日期显示格式.例如 format('yyyy-MM-dd') 其显示内容为：2015-09-07"},
	"offsetDay" : {value:"设置日期显示格式.例如 format('yyyy-MM-dd') 其显示内容为：2015-09-07"},
};
Date.prototype.format = function (fmt) { //author: meizz 
    var o = {
        "M+": this.getMonth() + 1, //月份 
        "d+": this.getDate(), //日 
        "h+": this.getHours(), //小时 
        "m+": this.getMinutes(), //分 
        "s+": this.getSeconds(), //秒 
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度 
        "S": this.getMilliseconds() //毫秒 
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
Date.prototype.offsetDate = function(offset){
	this.setDate(this.getDate() + offset);
	return this;
}

Date.prototype.offsetYear = function(offset){
	this.setYear(this.getFullYear() + offset);
	return this;
}

Date.prototype.offsetMonth = function(offset){
	this.setMonth(this.getMonth() + offset);
	return this;
}

Date.prototype.offsetDay = function(offset){
	this.setDay(this.getDay() + offset);
	return this;
}


Date.prototype.Date = function(date){
	this.setDate(date);
	return this;
}



function trace(){
	var value = "";
	var arr = null;
	for(var i = 0;i<arguments.length;i++){
		value += "[" + i + "]";
		if(typeof(arguments[i]) == 'array'){
			arr = arguments[i];
			for(var j = 0;j<arr.length;j++){
				value += arr[j] + ',';
			}
			value = value.subtring(0,value.length - 1);
			continue;
		}
		value += arguments[i] + " ";
	}
	alert(value);
}

/**
 * 将元素的所有属性打印出来
 */
function echo(){
	var value = "";
	var obj = null;
	var row = 0;
	for(var i = 0;i<arguments.length;i++){
		obj = arguments[i];
		rn = 1;
		value += "<div  style='line-height:26px;font-weight:bold;color:#aaaa00;text-align:left;'>Parameter " + i + " :</div>";
			value += "<div><table style='color:#fefefe;text-align:left;background-color:#444444;border-spacing:1px' width='100%'>" + 
			"<thead style='background-color:#000011'>" +
			"<th height='30' width='30' align='center' style='padding:2px'>ID</th><th align='center' style='padding:2px'>Name</th><th align='center' style='padding:2px'>Type</th><th align='center' style='padding:2px'>Value</th>" +
			"</thead><tbody>";
		
		rn = 1;
		
		
		for(var p in obj){
			value += "<tr>"
			try{
				value += "<td height='20' align='center' bgColor='#333333' style='padding:4px'>" + (rn ++) + 
				".</td><td nowrap width='100' bgColor='#333333' style='padding:4px'>" + p + 
				"</td><td width='100' bgColor='#333333' style='padding:4px'>" + _lib.getTypeHTML(obj[p]);
				if(typeof(obj[p]) == 'function'){
					value += "</td><td bgColor='#333333' style='padding:4px'><a href='javascript:void(0);' style='background-color:#555555;border:1px #444444 solid;color:#aaaaee;float:right;'>格式化</a>" +  $("<span/>").text(obj[p] + "").html() + "</td>";
				}else{
					value += "</td><td bgColor='#333333' style='padding:4px'>" +  $("<span/>").text(obj[p] + "").html() + "</td>";
				}
			}catch(e){
				alert("echo:[" + p + "]" + e);
			}
			value += "</tr>"
		}
		value += "</tbody></table></div>";
	}
	var content = $("<div class='free' style='background-color:#333333;padding-bottom:10px;border:#aaaaaa solid 1px;border-top:1px solid #bbbbbb;border-left:1px solid #999999;'><table style='width:100%'><tr><td style='background-color:#aaaaaa;height:30px;line-height:30px;margin-right:36px'>Echo v1.0</td>"
		+"<td style='width:36px;color:#fefefe;background-color:#aa0000' onclick='$(this).parent().parent().parent().parent().remove();'><label>X</label></td></tr></table></div>");
	var inner = $("<div/>");
	inner.html(value);
	content.append(inner);
	$("body").append(content);
	inner.css({overflow:'auto',padding:'10',paddingTop:'0'});
	content.css({position:'absolute',zIndex:'999',top:'40',left:'40'});
	if(inner.height()>$(window).height()){
		inner.height($(window).height() - 80);
	}
	if(inner.width()>$(window).width() - 80){
		inner.width($(window).width() - 80);
	}
	
	inner.height(inner.height());
	inner.width(inner.width());
	content.css({left:($(window).width() - content.width())/2,top:($(window).height() - content.height())/2});
	inner.find("td>a").click(function(){
		var $this = $(this).parent();
		$(this).remove();
		$this[0].innerHTML = asjs.decodeScript($this.html());
	});
}
 
 
//全局变量
var browser = null;
/**
 * 初始化AsJs环境
 */
(function(){
	if (/msie/i.test(navigator.userAgent)){ 
		browser = "ie5+"
	}else{
		browser = "other";
	}

})(); 





/**
 * asjs API 封装包
 */
var asjs = new function(){
	var __handle__ = [];
	
	/**
	 * 获取域名表示
	 * @param name 编译后的元素id字符串名字
	 */
	this.getDomain = function(name){
		var len = name.length;
		var tmp = null;
		for(var i = len - 1;i>=1;i--){
			tmp = name.substring(0,i);
			if(window[tmp]){
				return tmp;
			}
		}
		return name;
	}
	
	/**
	 * 获取name的原始名字
	 */
	this.getMName = function(name){
		var len = name.length;
		var tmp = null;
		for(var i = len - 1;i>=1;i--){
			tmp = name.substring(0,i);
			//if(window[tmp]){
				//alert(window[tmp] + "");
			//}
			if(window[tmp] && typeof(window[tmp]) == 'object' && (window[tmp] + '').indexOf('[object HTML') == -1){
				return name.substring(i); 
			}
		}
		return name;
	}
	
	this.decodeScript = function(codeValue){
    	var code = '';
        jsdecoder = new JsDecoder();
        jscolorizer = new JsColorizer();

        jsdecoder.s = codeValue;

        code = jsdecoder.decode();
        
		
		code = code.replace(/&/g, "&amp;");
        code = code.replace(/</g, "&lt;");
        code = code.replace(/>/g, "&gt;");
        jscolorizer.s = code;
        try {
            code = jscolorizer.colorize();
        } catch (e) {
            $('msg').innerHTML += 'error<br><br>'+new String(e).replace(/\n/g, '<br>');
            return;
        }
       
        /* debug:
        $('msg').innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;'+jscolorizer.showTimes().replace(/\n$/, '').replace(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;')+'<br>';
        */
        code = new String(code);
        code = code.replace(/(\r\n|\r|\n)/g, "<br>\n");
        code = code.replace(/<font\s+/gi, '<font@@@@@');
        code = code.replace(/( |\t)/g, '&nbsp;');
        code = code.replace(/<font@@@@@/gi, '<font ');

        code = code.replace(/\n$/, '');

        var count = 0;
        var pos = code.indexOf("\n");
        while (pos != -1) {
           count++;
           pos = code.indexOf("\n", pos+1);
        }
        count++;

        pad = new String(count).length;
        var lines = '';

        for (var i = 0; i < count; i++) {
            var p = pad - new String(i+1).length;
            var no = new String(i+1);
            for (k = 0; k < p; k++) { no = '&nbsp;'+no; }
            no += '&nbsp;';
            lines += '<div style="background: ' + '#333333' + '; color: #f0f0f0;margin-right:5px;">'+no+'</div>';
        }


        return "<table><tr><td>" + lines + "</td><td>" + code + "</td></tr></table>"; 
      
	}
	/**
 	 *	看看存不存在此对象
 	 * @param name		判断标示
 	 * @param obj		判断对象
 	 * @return			如果存在返回true,否则返回false;
 	 */
	this.HAVE = function (name,obj){
		if(name != null && document.getElementById(name) != undefined){
			alert("The Id [" + name + "] is exist.");
			return false;
		}
		try{
			obj = typeof(eval(obj))
			if(obj == "undefined"){
				return false;
			}
			alert("The Object " + name + "[" + obj + "] is exist.");
			return true;
		}catch(e){
			return false;
		}
	};
	
	
	/**
	 * 继承操作函数代码
	 */
	this.extendCode = function(father){
		var code = father.constructor.toString();
		var start = code.indexOf('{') + 1;
		var end = code.lastIndexOf('}');
		return code.substring(start,end);
	}//extendCode
	
	/**
	 * 继承父类的属性
	 */
	this.extend = function (dest,src){
		for (var p in src) { 
	        dest[p] = src[p]; 
	    } 
	    return dest;
	};
	
	//Pull out only certain bits from a very large integer, used to get the time
	//code information for the first part of a UUID. Will return zero's if there
	//aren't enough bits to shift where it needs to.
	var getIntegerBits = function(val,start,end){
	 var base16 = returnBase(val,16);
	 var quadArray = new Array();
	 var quadString = '';
	 var i = 0;
	 for(i=0;i<base16.length;i++){
	     quadArray.push(base16.substring(i,i+1));   
	 }
	 for(i=Math.floor(start/4);i<=Math.floor(end/4);i++){
	     if(!quadArray[i] || quadArray[i] == '') quadString += '0';
	     else quadString += quadArray[i];
	 }
	 return quadString;
	};
	
	//Replaced from the original function to leverage the built in methods in
	//JavaScript. Thanks to Robert Kieffer for pointing this one out
	var returnBase = function(number, base){
	 return (number).toString(base).toUpperCase();
	};
	
	 
	
	//pick a random number within a range of numbers
	//int b rand(int a); where 0 <= b <= a
	var rand = function(max){
	 return Math.floor(Math.random() * (max + 1));
	};
	
	/**
	 * uuid 
	 */
	this.uuid = function(len, radix) { 
		//
	    // Loose interpretation of the specification DCE 1.1: Remote Procedure Call
	    // since JavaScript doesn't allow access to internal systems, the last 48 bits
	    // of the node section is made up using a series of random numbers (6 octets long).
	    // 
	    var dg = new Date(1582, 10, 15, 0, 0, 0, 0);
	    var dc = new Date();
	    var t = dc.getTime() - dg.getTime();
	    var tl = getIntegerBits(t,0,31);
	    var tm = getIntegerBits(t,32,47);
	    var thv = getIntegerBits(t,48,59) + '1'; // version 1, security version is 2
	    var csar = getIntegerBits(rand(4095),0,7);
	    var csl = getIntegerBits(rand(4095),0,7);
	
	    // since detection of anything about the machine/browser is far to buggy,
	    // include some more random numbers here
	    // if NIC or an IP can be obtained reliably, that should be put in
	    // here instead.
	    var n = getIntegerBits(rand(8191),0,7) +
	            getIntegerBits(rand(8191),8,15) +
	            getIntegerBits(rand(8191),0,7) +
	            getIntegerBits(rand(8191),8,15) +
	            getIntegerBits(rand(8191),0,15); // this last number is two octets long
	    return tl + tm  + thv  + csar + csl + n;
	};
	

	
	
	
	/**
	 * 将元素节点复制一份
	 */
	this.copy = function(obj){
		return obj.cloneNode(true);
	}
	
	
	/**
	 * 加载函数
	 */
	this.load = function(url,compEvt,data,dataType){
		compEvt = compEvt ? compEvt :function(e){};
		data = data ? data : null;
		var ul = new URLLoader();
		var req = new URLRequest(url);
		req.method = URLRequestMethod.POST;
		req.data= data;
		req.dataType = dataType;//json,text,or null
		ul.addEventListener(Event.COMPLETE,compEvt);
		ul.load(req);
		if(data){data.url = url};
		return data;
	};
	
	/**
	 * 加载函数
	 */
	this.get = function(url,compEvt,data){
		compEvt = compEvt ? compEvt :function(e){};
		data = data ? data : null;
		var ul = new URLLoader();
		var req = new URLRequest(url);
		req.method = URLRequestMethod.GET;
		req.data= data;
		ul.addEventListener(Event.COMPLETE,compEvt);
		ul.load(req);
		if(data){data.url = url};
		return data;
	};
	
	/**
	 * 返回URLLoader
	 */
	this.url = function(url,compEvt,data){
		compEvt = compEvt ? compEvt :function(e){};
		data = data ? data : null;
		var ul = new URLLoader();
		var req = new URLRequest(url);
		req.method = URLRequestMethod.GET;
		req.data= data;
		ul.addEventListener(Event.COMPLETE,compEvt);
		ul.load(req);
		return ul;
	};
	
	
	/**
	 * @param 	domain
	 * @url		域名
	 * @compEvt	回调函数
	 * @data	数据
	 */
	this.handle = function(domain,url,compEvt,data){
		compEvt = compEvt ? compEvt :function(e){};
		data = data ? data : null;
		var ul = new URLLoader(domain);
		var req = new URLRequest(url);
		req.method = URLRequestMethod.GET;
		req.data= data;
		ul.addEventListener(Event.COMPLETE,compEvt);
		ul.load(req);
		__handle__.push({domain:domain,ul:ul});
		return ul;
	};
	
	/**
	 * 关闭所有域名下的链接
	 */
	this.closeHandle = function(domain){
		var p = null;
		for(var i = __handle__.length - 1;i>=0;i--){
			p = __handle__[i];
			if(!domain || p.domain == domain){
				p.ul.close();
				__handle__.splice(i,1);
			}
		}
	}
	
	this.send = this.load;
	this.post = this.load;
	
	
	/**
	 * 判断模块对象是否存在
	 * @param module	模块内容,名字用String
	 */
	this.exist = function(module){
		if(window.$$[module]){
			if(window.document.getElementById(window.$$[module].label) == undefined){
				return false;
			}
			if(window.$$[module].time){
				return false;
			}
			return true;
		}
		return false;
	}
	
	
	
	

}();










var stage = null;
document.ready = function(){
	/**
	 * 舞台类
	 */
	stage = new function(){
		var target = this;
		this.rect = {};
		document.body.style.margin = "0px";
		
		
		function getX(){
			return -(document.body.scrollLeft || document.documentElement.scrollLeft);
		}
		
		function getY(){
			return - (document.body.scrollTop || document.documentElement.scrollTop);
		}
		
		
		function getWidth(){
			return document.body.clientWidth + getX();
		}
		
		function getHeight(){
			return document.body.clientHeight + getY();
		}
		
		//判断是不是可添加字对象
		this.isChild = function(obj){
			if(obj.type = "displayObject"){
				return true;
			}else if(obj.father != null){
				return target.isChild(obj.father);
			}else{
				return false;
			}
		}
		
		
		/**
		 * 舞台宽
		 */
		this.stageWidth = function(){
			return document.body.offsetWidth;
		}
		
		/**
		 * 舞台高
		 */
		this.stageHeight = function(){
			return document.body.offsetHeight;
		}
		
		
		this.addChild = function(child){
			if(target.isChild(child)){
				document.body.appendChild(child.html);
			}
		}
		
		this.removeChild = function(child){
			
		}
		
		
		return this;
	}//State

}









/**
 * 将字符串数据进行整理,变成XML的可读类
 */
function XML(data){
	var _root = this;
	var xml = null;
	var arr = new Array();
	var btype 
	if(data != null){
		if(data instanceof Array){
			arr = data;
		}else{
			switch(browser){
				case "ie5+" : 
  					xml = new ActiveXObject("Microsoft.XMLDOM"); 
   					xml.loadXML(data);
					xml  = xml.childNodes;
				break;
				case "other" ://FireFox2.0、Safari2.0 
  					xml = (new DOMParser()).parseFromString(data, "text/xml").childNodes; 
				break;
				default :
				alert(browser);
 			} 
			for(var n = 0;n<xml.length;n++){
				arr.push(xml[n]);
			}
		}
	}
	
	
	
	
	/**
	 * 获取元素的属性
	 * @param name	属性名称
	 * @param value	属性值，可以不填写
	 */
	this.qname = function(name,value){//setAttribute,getAttribute
		if(!name){
			return arr[0].attributes;
		}
		var outStr = "";
		for(var i = 0;i<arr.length;i++){
			if(value != null){
				arr[i].setAttribute(name,value);
			}
			outStr += arr[i].getAttribute(name) + ",";
		}
		return outStr.substr(0,outStr.length - 1);
	}
	
	
	
	
	/**
	 * 长度
	 */
	this.length = function (){
		return arr.length;
	}
	
	
	/**
	 * 查找节点内容
	 */
	this.child = function (nodeName){
		
		if(nodeName && nodeName.charAt(0) == '@'){
			return this.qname(nodeName.substring(1));
		}else if(nodeName && nodeName.charAt(0) == '['){
			nodeName = nodeName.substr(1,nodeName.length - 2);
			var values = nodeName.split(".");
			var p = this.child(values[0]);
			var t = null;
			for(var n = 1;n<values.length;n++){
				t = values[n]; 
				if(t.charAt(t.length - 1) == ')'){
					p = p.at(t.substring(3,t.length - 1));
					continue;
				}
				p = p.child(t);
			}
			return p;
		}
		var a = new Array();
		var ch = null;
		for(var i = 0;i<arr.length;i++){
			ch = arr[i].childNodes;
			for(var j = 0;j<ch.length;j++){
				if(nodeName == null || ch[j].nodeName == nodeName){
					a.push(ch[j]);
				}
			}
		}
		return new XML(a);
	}
	
	
	/**
	 * 制定具体位置
	 */
	this.at = function (pos){
		var a = new Array();
		a.push(arr[pos]);
		return new XML(a);
	}
	
	/**
	 * 节点赋值
	 */
	this.node = function(value){
		if(value){
			for(var i = 0;i<arr.length;i++){
				if(typeof(value) == "string"){
					arr[i].parentNode.replaceChild(new XML(value)._nodeValue(0),arr[i]);
				}
				
			}
		}
	}
	
	this._nodeValue = function(p){
		return arr[p];
	}
	
	/**
	 * 获取XML格式内容
	 */
	this.toXMLString = function(){
		var outStr = "";
		var i = 0;
		switch(browser){
			case "ie5+":
				for(i = 0;i<arr.length;i++){
					outStr += arr[i].xml;
				}
			break;
			case "other" :
				for(i = 0;i<arr.length;i++){
					outStr += (new XMLSerializer()).serializeToString(arr[i]); 
				}
			break;
		}
		
		return outStr;
	}
	
	/**
	 * 获取JSON数据
	 */
	this.toJSON = function(){
		var obj = {};
		var arr = null;
		for(var i = 0;i<this.length();i++){
			arr = this.at(i).child('@');
			for(var j = 0;j<arr.length;j++){
				obj[arr[j].name] = arr[j].value;
			}
		}
		return obj;
	};
	
	/**
	 * 获取JSON数组
	 */
	this.toJSONArray = function(){
		var list = [];
		var obj = null;
		var arr = null;
		for(var i = 0;i<this.length();i++){
			arr = this.at(i).child('@');
			obj = {};
			for(var j = 0;j<arr.length;j++){
				obj["@"+arr[j].name] = arr[j].value;
			}
			var child = this.at(i).child();
			for(j = 0;j<child.length();j++){
				obj[child.at(j).getName()] = child.at(j).toString();
			}
			
			list.push(obj);
		}
		return list;
		
	};
	
	this.appendChild = function (data){
		var child = new XML("<response>" + data + "</response>").child();
		var len = child.length();
		if(arr.length == 1){
			for(var i = 0;i<len;i++){
				arr[0].appendChild(child._nodeValue(i));
			}
		}
	}
	
	/**
	 * 删除指定元素
	 * @param nodeName
	 * @return
	 */
	this.removeChild = function(nodeName){
		var len = 0;
		
		var pos = null;
		var child = null;
		
		for(var i = 0;i<arr.length;i++){
			pos = arr[i];
			if(nodeName instanceof XML){
				child = nodeName;
			}else{
				child = new XML([arr[i]]).child(nodeName);
			}
			
			len = child.length();
			for(var j = 0;j<len;j++){
				pos.removeChild(child._nodeValue(j));
			}
		}
	}
	
	
	this.getName = function(){
		return arr.length>0 ? arr[0].nodeName : null;
	}
	
	
	
	/**
	 * 重写toString方法
	 */
	this.toString = function(){
		var outStr = "";
		for(var i = 0;i<arr.length;i++){
			if(arr[i].childNodes.length != 0){
				outStr += arr[i].childNodes[0].wholeText;
			}
		}
		return outStr;
	}
	
}//XML

var URLRequestMethod = {GET:"get",POST:"post"};
var Event = {COMPLETE:"complete"};
var IOErrorEvent = {IO_Error:"ioError"};
/**
 *
 */
function URLRequest(url){
	//url
	this.URL = url;
	//执行方法，例如使用post方法还是用get方法
	this.method = URLRequestMethod.GET;
	//需要传递的数据，如果method == get ，此方法不生效。
	this.data = null;
}

/**
 * URLLoader 加载数据的请求
 */
function URLLoader(id){
	var req = null;
	var COMP_FUN = null;
	var IOERROR_FUN = null;
	//常量参数
	var READY_STATE_UNINITIALIZED = 0;
	var READY_STATE_LOADING = 1;
	var READY_STATE_LOADED = 2;
	var READY_STATE_INTERACTIVE = 3;
	var READY_STATE_COMPLETE = 4;
	var target = this;
	//最终获得的数据
	this.data = null;
	//加载函数
	this.load = function(urlRequest){
		if(urlRequest instanceof URLRequest){
			req = getRequest();
			if(req){
				req.onreadystatechange = onReadyState;
				var tmp = "";
				if(urlRequest.data != null && urlRequest.dataType != "json" && urlRequest.dataType != "text"){//既不是json，也不是text
					if(typeof(urlRequest.data) == 'string'){
						tmp = urlRequest.data;
						
					}else if(typeof(urlRequest.data) == 'object'){
						for(var p in urlRequest.data){
							var lst = urlRequest.data[p];
							if(lst instanceof Array){
								for(var t = 0;t<lst.length;t++){
									tmp += (p + '=' + encodeURIComponent(lst[t]) + '&');
								}
								continue;
							}
							tmp += (p + '=' + encodeURIComponent(lst) + '&');
						}
					}
				}
				if(urlRequest.method == URLRequestMethod.POST){
					req.open("POST",urlRequest.URL,true);
					req.withCredentials = true;
					//req.setRequestHeader("Content-Length",tmp.length);	
					if(urlRequest.dataType == "json"){
						req.setRequestHeader("Content-Type","application/json;charset=UTF-8");
						tmp = JSON.stringify(urlRequest.data);
						alert(tmp);
					}else if(urlRequest.dataType == "text"){
						req.setRequestHeader("Content-Type","text/plain;charset=UTF-8");
					}else{
						req.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
					}
					
					req.send(tmp);
				}
				else if(urlRequest.method == URLRequestMethod.GET){
					var urlTmp = urlRequest.URL;
					if(urlTmp.indexOf('?') != -1){
						urlTmp += '&' + tmp;
					}else{
						urlTmp += '?' + tmp;
					}
					req.open(urlRequest.method,urlTmp,true);
					req.withCredentials = true;
					req.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
					req.send();
				}
				
			}
		}else{
			throw "URLLoader::load(): The Value isn't URLRequest";
		}
	}
	//时间侦听器 
	this.addEventListener = function(type,listener,useCapture){
		switch(type){
			case Event.COMPLETE :
				COMP_FUN = listener;
			break;
			case IOErrorEvent.IO_Error :
				IOERROR_FUN = listener;
			break;
			default :
				throw "URLLoader::addEventListner(): no this type";
		}
	};//addEventListener
	
	this.close = function(){
		if(req){
			if(req.readyState != READY_STATE_COMPLETE){
				req.abort();
			}
			req = null;
			//console.log("...................close");
		}

	};
	
	/**
	 * 获取连接异常
	 */
	function getRequest(){
		var xRequest = null;
		if(window.XMLHttpRequest){
			xRequest = new XMLHttpRequest();
		}else if(window.ActiveXObject){
			xRequest = new ActiveXObject("Microsoft.XMLHTTP");
		}
		return xRequest;
	}
	
	function onReadyState(){
		var ready = req.readyState;
		if(ready == READY_STATE_COMPLETE){
			if(req.status == "200"){
				target.data = req.responseText;
				if(COMP_FUN != null){
					req = null;
					COMP_FUN({type:Event.COMPLETE,target:target,id:id});
				}
			}else{
				if(IOERROR_FUN != null){
					req = null;
					IOERROR_FUN({type:IOErrorEvent.IO_Error,target:target,id:id});
				}
			}
			
		}
	}
	

	
	
	
}//URLLoader








