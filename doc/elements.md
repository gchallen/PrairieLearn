
# Elements for use in `question.html`

## `pl_multiple_choice` element

```html
<pl_multiple_choice answers_name="acc" weight="1" inline="true">
  <pl_answer correct="false">positive</answer>
  <pl_answer correct="true">negative</answer>
  <pl_answer correct="false">zero</answer>
</pl_multiple_choice>
```

Attribute | Type | Default | Description
--- | --- | --- | ---
`answers_name` | string | — | Variable name to store data in.
`weight` | integer | 1 | Weight to use when computing a weighted average score over elements.
`inline` | boolean | false | List answer choices on a single line instead of as separate paragraphs.
`number_answers` | integer | special | The total number of answer choices to display. Defaults to displaying one correct answer and all incorrect answers.
`fixed_order` | boolean | false | Disable the randomization of answer order.

A `pl_multiple_choice` element selects one correct answer and zero or more incorrect answers and displays them in a random order as radio buttons.

An `pl_answer` element inside a `pl_multiple_choice` element has attributes:

Attribute | Type | Default | Description
--- | --- | --- | ---
`correct` | boolean | false | Is this a correct answer to the question?

## `pl_checkbox` element

```html
<pl_checkbox answers_name="vpos" weight="1" inline="true">
  <pl_answer correct="true">A-B</pl_answer>
  <pl_answer correct="true">B-C</pl_answer>
  <pl_answer>               C-D</pl_answer>
  <pl_answer correct="true">D-E</pl_answer>
  <pl_answer>               E-F</pl_answer>
  <pl_answer>               F-G</pl_answer>
</pl_checkbox>
```

Attribute | Type | Default | Description
--- | --- | --- | ---
`answers_name` | string | — | Variable name to store data in.
`weight` | integer | 1 | Weight to use when computing a weighted average score over elements.
`inline` | boolean | false | List answer choices on a single line instead of as separate paragraphs.
`number_answers` | integer | special | The total number of answer choices to display. Defaults to displaying all answers.
`min_correct` | integer | special | The minimum number of correct answers to display. Defaults to displaying all correct answers.
`max_correct` | integer | special | The maximum number of correct answers to display. Defaults to displaying all correct answers.
`fixed_order` | boolean | false | Disable the randomization of answer order.

A `pl_multiple_choice` element displays a subset of the answers in a random order as checkboxes.

An `pl_answer` element inside a `pl_multiple_choice` element has attributes:

Attribute | Type | Default | Description
--- | --- | --- | ---
`correct` | boolean | false | Is this a correct answer to the question?

## `pl_number_input` element

```html
<pl_number_input answers_name="v_avg" comparison="sigfig" digits="2" />
```

Attribute | Type | Default | Description
--- | --- | --- | ---
`answers_name` | string | — | Variable name to store data in.
`weight` | integer | 1 | Weight to use when computing a weighted average score over elements.
`correct_answer` | float | special | Correct answer for grading. Defaults to `data["correct_answers"][answers_name]`.
`label` | text | — | A prefix to display before the input box (e.g., `label="$F =$"`).
`suffix` | text | — | A suffix to display after the input box (e.g., `suffix="$\rm m/s^2$"`).
`display` | "block" or "inline" | "inline" | How to display the input field.
`comparison` | "relabs", "sigfig", or "decdig" | "relabs" | How to grade. "relabs" uses relative ("rtol") and absolute ("atol") tolerances. "sigfig" and "decdig" use "digits" significant or decimal digits.
`rtol` | number | 1e-5 | Relative tolerance for `comparison="relabs"`.
`atol` | number | 1e-8 | Absolute tolerance for `comparison="relabs"`.
`digits` | integer | 2 | number of digits that must be correct for `comparison="sigfig"` or `comparison="decdig"`.
`eps_digits` | integer | 3 | Additional digits (beyond `digits`) used to compute a grace tolerance.

## `pl_question_panel` element

```html
<pl_question_panel>
  This is question-panel text.
</pl_question_panel>
```

Only display contents when rendering the question panel.

## `pl_submission_panel` element

```html
<pl_submission_panel>
  This is submission-panel text.
</pl_submission_panel>
```

Only display contents when rendering the submission panel.

## `pl_answer_panel` element

```html
<pl_answer_panel>
  This is answer-panel text.
</pl_answer_panel>
```

Only display contents when rendering the answer panel.

## `pl_variable_score` element

```html
<pl_variable_score answers_name="v_avg" />
```

Attribute | Type | Default | Description
--- | --- | --- | ---
`answers_name` | string | — | Variable name to display score for.

Display the partial score for a specific answer variable.
