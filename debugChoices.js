/**
 * debugChoices
 * ------------
 * The Debugging questions in questionBank.json have long written answers,
 * which can't be graded automatically. So each one is played as multiple
 * choice instead: `correct` is the right diagnosis, `wrong` are three
 * plausible-but-incorrect ones. The positions are shuffled every round.
 *
 * Keyed by `question_id`. A Debugging question with no entry here is
 * skipped (and a warning is logged), so add an entry whenever you add one.
 */
export const DEBUG_CHOICES = {
  /* ------------------------------ Python ------------------------------ */
  "PY-BEG-DBG-001": {
    correct: "The print() line isn't indented under the if, so indent it",
    wrong: [
      "The if block needs curly braces around it",
      "`age` must be converted with int() before it can be compared",
      "`>=` isn't valid in Python; it should be written `=>`",
    ],
  },
  "PY-BEG-DBG-002": {
    correct: "The if line is missing its colon; it should be `if score >= 60:`",
    wrong: [
      "The condition needs parentheses: `if (score >= 60)`",
      "The print() line needs a semicolon at the end",
      "`score` must be declared with a type before it is used",
    ],
  },
  "PY-INT-DBG-001": {
    correct: "The default `cart=[]` is created once and shared by every call; use `cart=None` and build a new list inside",
    wrong: [
      "`append()` returns None, so the function must build the list with `+` instead",
      "The function needs a `global cart` statement to keep the list between calls",
      "Strings can't be appended to a list without converting them first",
    ],
  },
  "PY-INT-DBG-002": {
    correct: "`range(len(items) - 1)` stops one short, so the last element is never checked; use `range(len(items))`",
    wrong: [
      "`range(len(items))` starts at 1, so the first element would be skipped",
      "`==` must be replaced with `is` to compare numbers",
      "`return -1` must be changed to `return None`",
    ],
  },
  "PY-HARD-DBG-001": {
    correct: "Removing items while looping over the same list shifts positions and skips items; loop over a copy (`numbers[:]`) or use a list comprehension",
    wrong: [
      "`list.remove()` only works on strings, so `del numbers[n]` is needed",
      "The condition should be `n > 0` to remove the negative numbers",
      "`remove()` only deletes the first match, so the loop needs a `break`",
    ],
  },
  "PY-HARD-DBG-002": {
    correct: "Three bugs: the loop skips index 0, `count` is `len(numbers) - 1` instead of `len(numbers)`, and `//` truncates the average instead of using `/`",
    wrong: [
      "Two bugs: `total` should start at 1, and the function is missing a `print` call",
      "Only one bug: `//` should be `/`; the loop range and `count` are already correct",
      "Two bugs: `numbers[i]` should be `numbers[i - 1]`, and `count` should be `len(numbers) * 2`",
    ],
  },

  /* ---------------------------- JavaScript ---------------------------- */
  "JS-BEG-DBG-001": {
    correct: "The if condition is missing its closing parenthesis: `if (age >= 18) {`",
    wrong: [
      "`>=` should be written `=>` in JavaScript",
      "Numbers can't be declared with `let`; they need `var`",
      "The `console.log` line must be indented to belong to the if block",
    ],
  },
  "JS-BEG-DBG-002": {
    correct: "`const` can't be reassigned; declare `score` with `let` if it needs to change",
    wrong: [
      "`score = 90` should use `==` instead of `=`",
      "Numbers must be declared with `let`, never `const`",
      "`console.log` can't print a `const` variable",
    ],
  },
  "JS-INT-DBG-001": {
    correct: "`splice()` shifts later elements left, so the next `i++` skips one; step `i` back, loop backwards, or use `filter()`",
    wrong: [
      "`splice(i, 1)` removes every element from `i` to the end of the array",
      "`numbers[i] < 0` should be `numbers[i] > 0` to find negatives",
      "`numbers.length` is only read once, so the loop never stops",
    ],
  },
  "JS-INT-DBG-002": {
    correct: "`i < items.length - 1` stops one index early, so the last element is never checked; use `i < items.length`",
    wrong: [
      "`===` fails on numbers; it should be `==`",
      "The loop must start at `i = 1` because JavaScript arrays are 1-indexed",
      "`return -1` should be `return undefined`",
    ],
  },
  "JS-HARD-DBG-001": {
    correct: "The regular function passed to `setTimeout` gets its own `this` instead of `counter`; use an arrow function",
    wrong: [
      "`this.count++` is invalid syntax; it should be `count++`",
      "`setTimeout` can't be called inside an object method",
      "`count: 0` must be declared with `let` inside the object",
    ],
  },
  "JS-HARD-DBG-002": {
    correct: "Two bugs: `i <= arr.length` reads past the end, and `arr[i] % 2 = 0` assigns instead of comparing (use `===`)",
    wrong: [
      "Only one bug: the `=` in the if condition should be `===`; the loop bounds are correct",
      "Only one bug: `i <= arr.length` should be `i < arr.length`; the if condition is fine",
      "Two bugs: `results` should be `const`, and `push` should be `add`",
    ],
  },

  /* -------------------------------- Java -------------------------------- */
  "JAVA-BEG-DBG-001": {
    correct: "There is no semicolon after `int age = 20`",
    wrong: [
      "`int` must be capitalized as `Int`",
      "`age` has to be a `String` before it can be printed",
      "`System.out.println` needs the `new` keyword",
    ],
  },
  "JAVA-BEG-DBG-002": {
    correct: "A String literal can't be assigned to an `int`; write `int price = 100;` or change the type to `String`",
    wrong: [
      "`price` is a reserved word in Java",
      "`println` can only print Strings, so `price` must be in quotes",
      "`int` values must be written with a decimal point, like `100.0`",
    ],
  },
  "JAVA-INT-DBG-001": {
    correct: "You can't remove from an `ArrayList` inside a for-each loop; use `removeIf(n -> n < 0)` or an `Iterator`",
    wrong: [
      "`ArrayList` is fixed-size, so elements must be cleared with `set(i, null)`",
      "`Integer` can't be compared with `<`; the loop variable must be a primitive `int`",
      "`return numbers` has to come before the loop",
    ],
  },
  "JAVA-INT-DBG-002": {
    correct: "`i < items.length - 1` stops one index early, so the last element is never checked; use `i < items.length`",
    wrong: [
      "`==` compares references, so ints must be compared with `equals()`",
      "The loop must start at `i = 1`",
      "The method must return `null` instead of `-1`",
    ],
  },
  "JAVA-HARD-DBG-001": {
    correct: "The loop starts at `arr.length` (out of bounds) and `i > 0` never prints index 0; start at `arr.length - 1` and loop while `i >= 0`",
    wrong: [
      "Only the start is wrong: begin at `arr.length - 1`; the condition `i > 0` is already correct",
      "Java can't count down in a `for` loop, so it must use `i++`",
      "`arr[i]` should be `arr.get(i)` for `int` arrays",
    ],
  },
  "JAVA-HARD-DBG-002": {
    correct: "The constructor needs `this.balance = balance`, and with no braces the `return;` always runs, so `balance` is never reduced",
    wrong: [
      "Only one bug: the constructor needs `this.balance = balance`; the `if` in `withdraw` works as written",
      "Only one bug: `withdraw` needs braces around the `if`; the constructor is correct",
      "`balance` should be `static`, and `withdraw` must return a `double`",
    ],
  },

  /* -------------------------------- C++ -------------------------------- */
  "CPP-BEG-DBG-001": {
    correct: "There is no semicolon after `int age = 20`",
    wrong: [
      "`cout << age` should be `cout >> age`",
      "`int age` must be created with `new`",
      "`age` can't be printed until it is converted to a string",
    ],
  },
  "CPP-BEG-DBG-002": {
    correct: "`=` assigns 90 to `score` and is always true; use `==` to compare",
    wrong: [
      "`score` must be a `double` to be compared with 90",
      "The condition needs `&&` to combine two checks",
      "`cout` must end with `endl` or nothing is printed",
    ],
  },
  "CPP-INT-DBG-001": {
    correct: "`erase()` invalidates the iterator; use `it = numbers.erase(it)` (only `++it` otherwise) or the erase-remove idiom",
    wrong: [
      "`erase()` takes an index, so it must be called as `numbers.erase(*it)`",
      "`vector` doesn't support `erase()`; only `list` does",
      "`*it < 0` compares the address, so it should be `it < 0`",
    ],
  },
  "CPP-INT-DBG-002": {
    correct: "`i < size - 1` stops one index early, so the last element is never checked; use `i < size`",
    wrong: [
      "An `int items[]` can't be passed to a function; it must be a `vector`",
      "The loop must start at `i = 1` because C++ arrays are 1-indexed",
      "An `int` function can't `return -1`",
    ],
  },
  "CPP-HARD-DBG-001": {
    correct: "`i <= size` reads one element past the end (undefined behavior); use `i < size`",
    wrong: [
      "`cout << arr[i]` can't print an `int` element without a cast",
      "The loop must start at `i = 1` because index 0 is reserved",
      "The array must be passed as `int& arr[]` to be read",
    ],
  },
  "CPP-HARD-DBG-002": {
    correct: "`arr` is a local array, so the returned pointer dangles, and `delete[]` on memory not made with `new[]` is undefined; allocate with `new int[size]`",
    wrong: [
      "Only one bug: the loop should run to `i <= size`; the pointer handling is fine",
      "Only `delete[]` is wrong (it should be `delete result`); the returned pointer is valid",
      "`int arr[50]` is too small, and `cout` must be replaced with `printf`",
    ],
  },
};