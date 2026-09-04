{
  "mcpServers": {
    "firebase": {
      "args": [
        "-y",
        "firebase-tools@latest",
        "mcp"
      ],
      "command": "npx",
      "disabled": true
    },
    "supabase": {
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest"
      ],
      "command": "npx",
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_ce3e6f363e1eaee19845a94931be7e245d748bee",
        "SUPABASE_PROJECT_REF": "sbyvmktfmnucnmglajpr"
      }
    }
  }
}