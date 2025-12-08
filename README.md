# Nix CN Web

## Contribution

1. **Root docs serve the zh-CN version** _[MUST]_
2. **Use sign-off via `git commit -s`** _[MUST]_
3. **Do not modify the `main` branch for any reason** _[MUST]_
4. **Do not omit the commit subject for any reason** _[MUST]_
5. **Describe all changes in the commit message** _[MUST]_
6. **Rebase before submitting patches** _[MUST]_
7. **Commit message written in english** _[MUST]_
8. **Split commits for large or multi-part changes** _[OPTION]_
9. **Use OpenPGP/SSH for commit signing** _[OPTION]_
10. **Have fun contributing :)** _[VERY NECESSARY]_

## Toolchain

- Zed Editor
- Node 22
- Pnpm 10.24
- Corepack
- Cloudflare

## Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `yarn install`         | Installs dependencies                            |
| `yarn dev`             | Starts local dev server at `localhost:4321`      |
| `yarn build`           | Build your production site to `./dist/`          |
| `yarn preview`         | Preview your build locally, before deploying     |
| `yarn astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `yarn astro -- --help` | Get help using the Astro CLI                     |
