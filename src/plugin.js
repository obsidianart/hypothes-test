(function (root, factory) {
    if ( typeof define === 'function' && define.amd ) {
        define(factory);
    } else if ( typeof exports === 'object' ) {
        module.exports = factory;
    } else {
        root.FriendsTagger = factory(root);
    }
})(this, function (root) {
  const exports = {}; // Object for public APIs
  const supports = !!document.querySelector && !!root.addEventListener; // Feature test
  let userList = [] // This is the fetched list
  let lastCursorPosition = 0 // This is to remember where the user was typing before clicking on a suggestion

  const fetchUsersList = url =>(
    fetch(url)
      .then(response=>{
        if (response.statusCode >= 400) throw new Error('Unexpected response code') 
        return response
      })
      .then(response=>response.json())
      .catch(err=>{
        // Not sure what to do here but we can't work without the json
        console.error(err)
        console.error("The pluging can't load the data")
      })
  )

  const getMatchingFriends = (text)=>{
    // I don't think showing suggestion when user types 1 letter is useful, but there's no spec
    if (!text || text.length<2) return []
    // Ignoring if user starts typing the surnmae
    return userList.filter(friend=> friend.username.toLocaleLowerCase().startsWith(text) || friend.name.toLocaleLowerCase().startsWith(text))
  }

  const getCaretPosition = (ctrl) => {
    let start, end;
    if (ctrl.setSelectionRange) {
        start = ctrl.selectionStart;
        end = ctrl.selectionEnd;
    } else if (document.selection && document.selection.createRange) {
        const range = document.selection.createRange();
        start = 0 - range.duplicate().moveStart('character', -100000);
        end = start + range.text.length;
    }
    return {
        start: start,
        end: end
    }
  }

  function getWordAndCursorPosition(){
    const caret = getCaretPosition(this);
    let endPos = this.value.indexOf(' ',caret.end);
    if (endPos ==-1) endPos = this.value.length;
    const result = /\S+$/.exec(this.value.slice(0, endPos));
    let word = result ? result[0] : null;
    if (word) word = word.replace(/['";:,.\/?\\-]$/, ''); // remove punctuation, should we?
    return {word, cursorPosition:endPos}
  }

  function insertAtCaretAndRemovePreviousWord(el, text) {
    const caretPos = el.selectionStart;
    const textAreaTxt = el.value;
    const beforeCaret = textAreaTxt.substring(0, caretPos)
    const spaceBeforeLastWord = beforeCaret.lastIndexOf(" ") + 1;
    el.value = textAreaTxt.substring(0, spaceBeforeLastWord) + text + textAreaTxt.substring(caretPos);
  }

  const attachPlugin = selector => {
    const createElement= (type, className)=> {
      const el = document.createElement(type)
      el.className = `friendsTagger-${className}`
      return el
    }

    const rebuildHtmlStructure = el => {
      // create wrapper container
      const container = createElement('div', 'container')
      const highlighter = createElement('div', 'highlighter')
      const typehead = createElement('div', 'typehead')
      const suggestionList = createElement('ul', 'suggestion-list list-group')

      // insert wrapper before el in the DOM tree
      el.parentNode.insertBefore(container, el)
      container.appendChild(highlighter)
      container.appendChild(typehead)
      container.appendChild(suggestionList)
      typehead.appendChild(el)

      return {
        container,
        highlighter,
        typehead,
        suggestionList,
      }
    } 

    // Can we have more than one?
    document.querySelectorAll(selector).forEach(el=>{
      // Twitter actually uses editable divs, which are probably better solution if we have control over the html,
      // but the requirement is for an input field
      // We can swap for a div but matching the style might be a nightmare...

      const {container, highlighter, typehead, suggestionList} = rebuildHtmlStructure(el)

      const showFriendsSuggestion = (text)=>{
        // Anchors are semantically right but need styling
        const matches = getMatchingFriends(text).map(friend=>`
          <a href="#">
            <li data-name="${friend.name}" class="list-group-item">
              <img src="${friend.avatar_url}">
              ${friend.name}
            </li>
          </a>
        `)
        suggestionList.innerHTML = matches.join('')
      }

      const hideFriendsSuggestion = ()=> {
        suggestionList.innerHTML = ''
      }

      suggestionList.addEventListener('click', (e)=>{
        //Avoid anchor following link - it doesn't stop propagation
        e.preventDefault()

        // Find the li element (we are using delegation)
        let delegationFinder = e.target
        // TODO: exit condition if not found
        while (!delegationFinder.getAttribute('data-name')) {
          delegationFinder = e.target.parentNode
        }

        if (!delegationFinder) throw new Error('Something went wrong with delegation')

        insertAtCaretAndRemovePreviousWord(el, delegationFinder.getAttribute('data-name'))
        hideFriendsSuggestion()
      })

      // I'm not writing a destroy for the plugin but I'm aware this event would have to be removed
      el.addEventListener("keyup", function(){
        const {word, cursorPosition} = getWordAndCursorPosition.call(this)
        lastCursorPosition = cursorPosition
        showFriendsSuggestion(word)
      })
    })
  }

  exports.init = async ({list, selector})=> {
    if (!supports) return;
    if (!list) throw new Error('Missing list option. This is mandatory and should be the url of the user\'s list')
    if (!selector) throw new Error('Missing selector option. This is mandatory and should be the css selector of the textarea (or input)')
    
    userList = await fetchUsersList(list)
    // In here we might want to attach a listener to see if the page change over time (in case the form appears when the user scroll)
    attachPlugin(selector)

  };


  //
  // Public APIs
  //

  return exports;

})