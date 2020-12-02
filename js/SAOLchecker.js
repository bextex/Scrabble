export default class SAOLchecker {
  // v 2.0, 2020-11-11 19:12

  static lookupWord(word) { // returns html/text (use with await)
    word = this.eq(word);
    this.toResolve = this.toResolve || {};
    this.cache = this.cache || {};
    window.saolCheckCallback = window.saolCheckCallback || ((word, explain) => {
      this.cache[word] = explain;
      this.toResolve[word](explain);
    });
    let p = new Promise(res => { this.toResolve[word] = res; });
    if (this.cache[word]) { this.toResolve[word](this.cache[word]); }
    else { $.getScript('https://saol.nodehill.se/' + encodeURIComponent(word)); }
    return p;
  }

  static async scrabbleOk(word) { // returns true/false (use with await)
    word = this.eq(word);
    let html = $('<div>' + await this.lookupWord(word) + '</div>');
    let text = this.eq(html.find('h1').text());
    let text2 = this.eq(html.find('.fm').text());
    return text === word || text2 === word;
  }

  static eq(word) {
    word = word.toLowerCase();
    let clean = '';
    for (let c of word) {
      clean += c.toUpperCase() !== c || c === ' ' ? c : '';
    }
    let a = 'åäö'.split(''), b = 'ABC'.split('');
    a.forEach((x, i) => clean = clean.split(x).join(b[i]));
    clean = clean.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
    b.forEach((x, i) => clean = clean.split(x).join(a[i]));
    return clean;
  }

}