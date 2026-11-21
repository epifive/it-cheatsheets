# Power Automate expressions cheat sheet

Expressions go in the Expression tab of the dynamic content panel (or after @ in code view). Strings use single quotes, never double quotes. Every function and parameter below is taken from Microsoft Learn's reference guide to workflow expression functions; parameters marked with ? are optional.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Power Automate cloud flows and Azure Logic Apps |
| **Version scope** | Workflow Definition Language expression functions, as used by Power Automate cloud flows and Azure Logic Apps (Consumption and Standard) |
| **Commands** | 68 (0 marked destructive) |
| **Last verified** | 2026-10-29 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/power-automate-expressions](https://www.epifive.com/cheatsheets/power-automate-expressions)

## Contents

- [Dates and times](#dates-and-times)
- [Strings](#strings)
- [Arrays and collections](#arrays-and-collections)
- [Logical and conditional](#logical-and-conditional)
- [Conversion](#conversion)
- [Trigger, actions and workflow](#trigger-actions-and-workflow)
- [Null-safe access and common patterns](#null-safe-access-and-common-patterns)
- [FAQ](#faq)
- [References](#references)

## Dates and times

| Command | What it does | Example |
|---|---|---|
| `utcNow('<format>'?)` | Current timestamp in UTC. Without a format it returns ISO 8601, for example 2026-10-29T05:18:31.3384797Z.<br>*Note:* Flows run in UTC. Convert to local time with convertFromUtc() or convertTimeZone() before showing a time to people. | `utcNow('yyyy-MM-dd')` |
| `addDays('<timestamp>', <days>, '<format>'?)` | Add a positive or negative number of days to a timestamp.<br>*Note:* addHours(), addMinutes() and addSeconds() take the same parameters. | `addDays(utcNow(), -7, 'yyyy-MM-dd')` |
| `addToTime('<timestamp>', <interval>, '<timeUnit>', '<format>'?)` | Add any number of time units to a timestamp.<br>*Note:* timeUnit is one of Second, Minute, Hour, Day, Week, Month, Year. | `addToTime(utcNow(), 1, 'Month')` |
| `subtractFromTime('<timestamp>', <interval>, '<timeUnit>', '<format>'?)` | Subtract a number of time units from a timestamp. | `subtractFromTime(utcNow(), 1, 'Week')` |
| `getPastTime(<interval>, <timeUnit>, <format>?)` | Current timestamp minus the given time units, without calling utcNow() yourself.<br>*Note:* getFutureTime() works the same way forwards, for example getFutureTime(5, 'Day'). | `getPastTime(1, 'Day', 'yyyy-MM-dd')` |
| `formatDateTime('<timestamp>', '<format>'?, '<locale>'?)` | Return a timestamp in a standard or custom .NET date format. The locale defaults to en-us.<br>*Note:* Case matters in the pattern: MM is the month and mm is minutes; HH is 24-hour and hh is 12-hour (add tt for AM/PM). | `formatDateTime(utcNow(), 'dd-MM-yyyy HH:mm')` |
| `parseDateTime('<timestamp>', '<locale>'?, '<format>'?)` | Turn a date string, such as a dd/MM/yyyy value typed into a form, into a timestamp.<br>*Note:* Without a format it tries the formats that suit the locale, which defaults to en-us (month first). | `parseDateTime('25/12/2026', 'en-GB', 'dd/MM/yyyy')` |
| `convertTimeZone('<timestamp>', '<sourceTimeZone>', '<destinationTimeZone>', '<format>'?)` | Convert a timestamp from one time zone to another.<br>*Note:* Time zone names come from the Windows default time zones list, for example India Standard Time, GMT Standard Time or Eastern Standard Time. | `convertTimeZone(utcNow(), 'UTC', 'India Standard Time', 'dd-MM-yyyy HH:mm')` |
| `convertFromUtc('<timestamp>', '<destinationTimeZone>', '<format>'?)` | Convert a UTC timestamp to a local time zone.<br>*Note:* The reverse is convertToUtc('&lt;timestamp&gt;', '&lt;sourceTimeZone&gt;', '&lt;format&gt;'?). | `convertFromUtc(utcNow(), 'GMT Standard Time', 'dd MMM yyyy HH:mm')` |
| `startOfDay('<timestamp>', '<format>'?)` | The same date at 00:00:00, for example to filter items created today.<br>*Note:* startOfHour() and startOfMonth() work the same way. | `startOfDay(convertFromUtc(utcNow(), 'India Standard Time'))` |
| `startOfMonth('<timestamp>', '<format>'?)` | The first day of the month at 00:00:00. | `startOfMonth(utcNow(), 'yyyy-MM-dd')` |
| `dayOfWeek('<timestamp>')` | Day of the week as a number, where Sunday is 0 and Saturday is 6.<br>*Note:* dayOfMonth() and dayOfYear() return the day of the month and of the year. | `or(equals(dayOfWeek(utcNow()), 0), equals(dayOfWeek(utcNow()), 6))` |
| `dateDifference('<startDate>', '<endDate>')` | Time between two timestamps as a timespan string such as 1268.00:00:00 (days.hours:minutes:seconds).<br>*Note:* Negative when startDate is later than endDate. | `dateDifference('2015-02-08', '2018-07-30')` |
| `ticks('<timestamp>')` | Number of 100-nanosecond ticks since 1 January 0001, useful for doing maths on dates.<br>*Note:* One day is 864000000000 ticks, so the example gives the whole days since 1 January 2026. | `div(sub(ticks(utcNow()), ticks('2026-01-01T00:00:00Z')), 864000000000)` |

## Strings

| Command | What it does | Example |
|---|---|---|
| `concat('<text1>', '<text2>', ...)` | Join two or more strings. | `concat('INV-', formatDateTime(utcNow(), 'yyyyMMdd'), '-', variables('Counter'))` |
| `substring('<text>', <startIndex>, <length>)` | Characters from a zero-based position, for a given length.<br>*Note:* Fails if startIndex plus length goes past the end of the text. Use slice() when the text may be shorter. | `substring('hello world', 6, 5)` |
| `slice('<text>', <startIndex>, <endIndex>?)` | Characters from a start position up to (not including) an end position. A negative start counts from the end.<br>*Note:* Returns an empty string instead of an error when the start is past the end of the text. | `slice('Hello World', -5)` |
| `replace('<text>', '<oldText>', '<newText>')` | Replace a substring with another string and return the result. Case-sensitive. | `replace(triggerBody()?['Title'], ' ', '-')` |
| `split('<text>', '<delimiter>')` | Split a string into an array at a delimiter. | `split('a_b_c', '_')` |
| `toLower('<text>')` | Lowercase a string, for example before comparing email addresses.<br>*Note:* toUpper('&lt;text&gt;') returns uppercase. | `toLower(triggerBody()?['Email'])` |
| `trim('<text>')` | Remove leading and trailing whitespace. | `trim(' Hello World  ')` |
| `indexOf('<text>', '<searchText>')` | Zero-based position of a substring, or -1 when it is not found. Not case-sensitive.<br>*Note:* lastIndexOf() finds the last occurrence; nthIndexOf('&lt;text&gt;', '&lt;searchText&gt;', &lt;occurrence&gt;) finds the nth. | `indexOf('hello world', 'world')` |
| `startsWith('<text>', '<searchText>')` | True when a string starts with a substring. Not case-sensitive.<br>*Note:* endsWith('&lt;text&gt;', '&lt;searchText&gt;') checks the end, also not case-sensitive. | `startsWith(triggerBody()?['Subject'], 'RE:')` |
| `length('<collection>')` | Number of characters in a string or items in an array. | `length(body('Get_items')?['value'])` |
| `guid('<format>'?)` | A new random GUID string. Format N, D (default), B, P or X. | `guid('N')` |
| `formatNumber(<number>, <format>, <locale>?)` | Format a number as a string using a .NET numeric format string. The locale defaults to en-us. | `formatNumber(1234567890, '#,##0.00', 'en-US')` |

## Arrays and collections

| Command | What it does | Example |
|---|---|---|
| `createArray('<object1>', '<object2>', ...)` | Build an array from several values.<br>*Note:* array('&lt;value&gt;') wraps a single value in an array. | `createArray('admin@contoso.com', 'it@contoso.com')` |
| `first('<collection>')` | First item of an array, or first character of a string.<br>*Note:* Wrap in coalesce() or check empty() first if the array can be empty. | `first(body('Get_items')?['value'])` |
| `last('<collection>')` | Last item of an array, or last character of a string. | `last(split(triggerBody()?['FileName'], '.'))` |
| `contains('<collection>', '<value>')` | True when a string has a substring, an array has a value, or an object has a key. Case-sensitive. | `contains(toLower(triggerBody()?['Subject']), 'invoice')` |
| `empty('<collection>')` | True when a string, array or object is empty. | `empty(body('Get_items')?['value'])` |
| `join([<collection>], '<delimiter>')` | Join array items into one string with a separator. | `join(variables('Recipients'), ';')` |
| `union([<collection1>], [<collection2>], ...)` | All items from two or more arrays (or objects), with no duplicates. | `union(variables('ListA'), variables('ListB'))` |
| `intersection([<collection1>], [<collection2>], ...)` | Only the items that appear in every array (or object) given. | `intersection(createArray(1, 2, 3), createArray(101, 2, 1, 10))` |
| `skip([<collection>], <count>)` | Drop a number of items from the front of an array and return the rest.<br>*Note:* The example drops the header line of CSV text; decodeUriComponent('%0A') is a line break. | `skip(split(variables('CsvText'), decodeUriComponent('%0A')), 1)` |
| `take('<collection>', <count>)` | The first items of an array, or the first characters of a string. | `take(body('Get_items')?['value'], 5)` |
| `sort([<collection>], <sortBy>?)` | Sort an array. For an array of objects, give the key to sort by.<br>*Note:* Wrap in reverse(\[&lt;collection&gt;\]) for descending order. | `sort(body('Get_items')?['value'], 'Title')` |

## Logical and conditional

| Command | What it does | Example |
|---|---|---|
| `if(<expression>, <valueIfTrue>, <valueIfFalse>)` | Return one value or another depending on a true or false expression. | `if(equals(triggerBody()?['Priority'], 'High'), 'Urgent', 'Normal')` |
| `equals('<object1>', '<object2>')` | True when two values, expressions or objects are equivalent.<br>*Note:* To compare text without regard to case, lowercase both sides with toLower() first. | `equals(toLower(triggerBody()?['Status']), 'approved')` |
| `and(<expression1>, <expression2>, ...)` | True only when every expression is true. | `and(greater(variables('Amount'), 10000), equals(variables('Region'), 'IN'))` |
| `or(<expression1>, <expression2>, ...)` | True when at least one expression is true. | `or(empty(triggerBody()?['Manager']), equals(triggerBody()?['Manager'], 'none'))` |
| `not(<expression>)` | Flip true to false and false to true. | `not(empty(body('Get_items')?['value']))` |
| `greater(<value>, <compareTo>)` | True when the first number or string is greater than the second.<br>*Note:* greaterOrEquals() also returns true when the values are equal. | `greater(length(body('Get_items')?['value']), 0)` |
| `less(<value>, <compareTo>)` | True when the first number or string is less than the second.<br>*Note:* lessOrEquals() also returns true when the values are equal. Comparing ticks() values is the reliable way to compare dates. | `less(ticks(item()?['DueDate']), ticks(utcNow()))` |

## Conversion

| Command | What it does | Example |
|---|---|---|
| `int('<value>')` | Convert a string such as '10' to an integer. | `add(int(triggerBody()?['Quantity']), 1)` |
| `float('<value>', '<locale>'?)` | Convert a string to a floating-point number, optionally reading a locale-specific format.<br>*Note:* decimal('&lt;value&gt;') keeps full decimal precision; wrap its result in string() to preserve it. | `float('10,000.333')` |
| `string(<value>)` | Convert any value to a string. Null becomes an empty string. | `string(variables('Total'))` |
| `bool(<value>)` | Convert a value to true or false: 1, -1 and 'true' give true; 0 and 'false' give false. | `bool(triggerBody()?['IsActive'])` |
| `json('<value>')` | Convert a JSON string (or XML) into an object or array you can read properties from. | `json(variables('JsonText'))?['id']` |
| `base64('<value>')` | Base64-encode a string. | `base64('hello')` |
| `base64ToString('<value>')` | Decode a base64 string back to text.<br>*Note:* Use this instead of decodeBase64(), which is deprecated. | `base64ToString('aGVsbG8=')` |
| `uriComponent('<value>')` | URL-encode a string so it is safe in a query string or path.<br>*Note:* Preferred over encodeUriComponent(). Decode with uriComponentToString(). | `concat('https://example.com/search?q=', uriComponent(triggerBody()?['Query']))` |

## Trigger, actions and workflow

| Command | What it does | Example |
|---|---|---|
| `triggerBody()` | The body output of the flow's trigger. Shorthand for trigger().outputs.body. | `triggerBody()?['Title']` |
| `triggerOutputs()` | The full trigger output, including headers. Shorthand for trigger().outputs. | `triggerOutputs()?['headers']` |
| `body('<actionName>')` | The body output of an action. Shorthand for actions('&lt;actionName&gt;').outputs.body.<br>*Note:* Use the action's name with spaces replaced by underscores. | `body('Get_items')?['value']` |
| `outputs('<actionName>')` | All outputs of an action, such as statusCode, headers and body. | `outputs('HTTP')?['statusCode']` |
| `actions('<actionName>')` | The whole action object at run time, including its status. | `actions('Get_user')?['status']` |
| `items('<loopName>')` | The current item in a named Apply to each (for-each) loop.<br>*Note:* item() returns the current item of the loop or repeating action you are in. | `items('Apply_to_each')?['Email']` |
| `variables('<variableName>')` | The current value of a variable created with Initialize variable. | `variables('Counter')` |
| `workflow().<property>` | Details about the running flow: name, type, id, location, run and tags.<br>*Note:* Power Automate flows carry the flowDisplayName and environmentName tags; workflow()?\['run'\]?\['name'\] is the name of the current run. | `workflow()?['tags']?['flowDisplayName']` |
| `result('<scopedActionName>')` | An array of results from the top-level actions inside a Scope, Apply to each or Do until, for error handling.<br>*Note:* Run it in an action set to run after the scope has failed, then filter the array for items whose status is Failed. | `result('Try')` |

## Null-safe access and common patterns

| Command | What it does | Example |
|---|---|---|
| `<object>?['<property>']` | The ? (null ignore) operator: return null instead of failing when the object is null or the property is missing.<br>*Note:* Without ?, a missing property fails the flow with 'Unable to process template language expressions'. | `triggerBody()?['Manager']?['Email']` |
| `coalesce(<object_1>, <object_2>, ...)` | The first value that is not null.<br>*Note:* Empty strings, empty arrays and empty objects are not null, so coalesce() keeps them. | `coalesce(triggerBody()?['Department'], 'Unassigned')` |
| `coalesce(trigger().outputs?.body?['<property-name>'], '<property-default-value>')` | Chain ? through several levels and fall back to a default when anything along the way is missing. | `coalesce(trigger().outputs?.body?['Priority'], 'Normal')` |
| `if(empty(<value>), '<fallback>', <value>)` | Use a fallback when a value is null or empty (coalesce() alone does not catch empty strings). | `if(empty(triggerBody()?['Phone']), 'Not given', triggerBody()?['Phone'])` |
| `@{<expression>}` | Insert an expression's result into surrounding text; the value is converted to a string. | `Request @{triggerBody()?['ID']} was approved on @{formatDateTime(utcNow(), 'dd-MM-yyyy')}` |
| `formatDateTime(convertFromUtc(utcNow(), '<destinationTimeZone>'), '<format>')` | Today's date in local time, ready for an email subject or a file name. | `formatDateTime(convertFromUtc(utcNow(), 'India Standard Time'), 'yyyy-MM-dd')` |
| `length(coalesce(body('<actionName>')?['value'], createArray()))` | Count the items an action returned, giving 0 instead of an error when the list is missing. | `length(coalesce(body('Get_items')?['value'], createArray()))` |

## FAQ

### How do I add an expression in Power Automate?

Click in the field, open the dynamic content panel, choose the Expression tab (fx in the new designer), type the expression without a leading @ and select Add or OK. In code view and inside text you write it as @{expression}.

### How do I avoid 'Unable to process template language expressions' errors?

That error usually means a property is missing or null. Read properties with the ? operator, for example triggerBody()?\['Email'\], and add a default with coalesce(), for example coalesce(triggerBody()?\['Email'\], ''). Check arrays with empty() before calling first().

### How do I get the current date in my time zone?

utcNow() is always UTC. Convert it with convertFromUtc(utcNow(), 'India Standard Time') or convertTimeZone(), using Windows time zone names, then format it with formatDateTime(..., 'dd-MM-yyyy').

### Why does my condition compare dates wrongly?

Timestamps are strings, and different formats compare as text. Compare ticks() values instead, for example less(ticks(item()?\['DueDate'\]), ticks(utcNow())), or format both sides with the same formatDateTime() pattern first.

## References

Every command above was checked against these official pages:

- [Reference guide to functions in expressions for workflows in Azure Logic Apps and Power Automate (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/logic-apps/workflow-definition-language-functions-reference)
- [Workflow Definition Language schema reference: operators, including ? (Microsoft Learn)](https://learn.microsoft.com/en-us/azure/logic-apps/logic-apps-workflow-definition-language)
- [Use expressions in conditions in Power Automate (Microsoft Learn)](https://learn.microsoft.com/en-us/power-automate/use-expressions-in-conditions)
- [Default time zones for Windows (Microsoft Learn)](https://learn.microsoft.com/en-us/windows-hardware/manufacture/desktop/default-time-zones)

---

Last verified 2026-10-29. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
