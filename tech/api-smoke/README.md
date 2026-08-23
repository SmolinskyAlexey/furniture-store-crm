# Furniture API smoke tests

Copy `config.example.json` to `config.json` and fill a real `AgentAI` key from `api_keys`.

The Furniture dump already contains the `api_keys` table with this shape:

- `name`
- `tech_name`
- `key`
- `can_add`
- `can_edit`
- `can_get_list`
- `can_download_files`
- `can_delete`

For this read-only API batch, the key needs `tech_name='AgentAI'` and `can_get_list=1`.

Run:

```bash
php tech/api-smoke/run.php tech/api-smoke/config.json
```
