# APN — Abstract Prefix Notation

All code MUST follow these conventions. Only execptions are existing API's that won't work with custom variable names.

## Variable Prefixes (abstract types)

| Prefix | Type | Example |
|--------|------|---------|
| `n_` | number | `n_age = 25` |
| `s_` | string | `s_name = "hans"` |
| `b_` | boolean | `b_done = true` |
| `o_` | object | `o_user = {s_name: "hans"}` |
| `a_` | array | `a_n = [1,2,3]` |
| `f_` | function | `f_run = ()=>{}` |
| `v_` | unknown/mixed | `v_input = ...` |

Composites: `a_n_` = array of numbers, `a_o_` = array of objects, `a_a_n_` = 2D number array.

## Functions

- Define with variable declaration: `let f_test = function(){...}` — no class methods.
- Second prefix = return type: `f_n_sum`, `f_o_person`, `f_b_valid`.
- No return prefix if function returns nothing: `f_save_file`.
- No redundant verbs: `f_s_env__example` not `f_s_generate__env_example`.
- A v preefix if function returns mixed value `f_v_data`

## No Classes

Use factory functions instead:
```js
let f_o_person = function(s_name, n_age){ return {s_name, n_age} }
```

## No Plural Words — Ever

`a_o_user` not `users`. `a_n_score` not `scores`. `a_s_name` not `names`.
Array prefix `a_` already signals "many".

## Naming Order: Generic → Specific

Base type comes first, qualifier after `__`:
- `n_id__frame` not `n_frame_id`
- `n_idx__start` not `n_start_index`
- `n_ms__timestamp` not `n_timestamp_ms`
- `a_o_user__filtered` not `filtered_users`
- `o_person__hans` not `o_hans_person`

## Boolean: No `is_` Prefix

`b_done` not `b_is_done`.

## Abbreviations (fixed set — do not invent new ones)

```
idx=index, pos=position, off=offset, k=key, el=element, evt=event,
val=value, len=length, sz=size, cnt=count, cur=cursor, ptr=pointer,
ms=milliseconds, us=microseconds, ns=nanoseconds, sec=seconds,
ts=timestamp, dt=delta_time, ttl=time_to_live,
trn=translation, scl=scale, rot=rotation,
its=iterations, it=iteration, nor=normalized
width=n_scl_x, height=n_scl_y
```

Do NOT abbreviate unnecessarily. Long names are fine: `a_o_person__filtered`.


## Database Relations

- Table: `a_o_{entity}` (e.g. `a_o_person`)
- Primary key: `n_id` (integer) or `s_id` (UUID)
- Foreign key: `n_o_{entity}_n_id` (e.g. `n_o_person_n_id`)

## Synonyms (first word is canonical)

array = list, function = method, object = dictionary = instance

---

# CLI Script Architecture

Every terminal-callable script MUST follow this structure in order:

1. **Dependency guard** — on import failure, print install instructions (recommend venv for Python), exit 1.
2. **Argument parsing + summary table** — use standard parser (`argparse`, `clap`), print table showing each arg's name, value, and whether provided or default.
3. **Processing with logging & timing** — print timestamped progress `[00:01.342]`, time each major function.
4. **Machine-readable output (IPC)** — tagged blocks on stdout using `S_UUID` from `.env` or `--s-uuid` arg:
   ```
   {S_UUID}_start_json
   {"status": "complete", "n_elapsed_s": 11.993}
   {S_UUID}_end_json
   ```
5. **Performance summary** — print timing table at end.
6. **Exit codes** — 0=success, 1=missing deps/bad args, 2=processing error.

---

# Misc Rules

- First line of every source file: `// Copyright (C) [year] [Jonas Immanuel Frey] - Licensed under [license]. See LICENSE file for details`
- `aifix` inline comments mark locations needing attention — the comment describes the issue, following lines are context to fix.
- After each response, append a one-liner summary to `AI_responses_summaries.md`: `YYYY-MM-DD HH:MM:SS - summary of what was done`

---
after each response , if this is a git repository , make a git commit with a summary message of the changes
