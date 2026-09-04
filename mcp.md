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
        "SUPABASE_ACCESS_TOKEN": " ",
        "SUPABASE_PROJECT_REF": " "
      }
    }
  }
}