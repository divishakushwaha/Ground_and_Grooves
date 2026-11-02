# How we work together

1. **Fork** the main repository to your GitHub account and **clone** your fork.
2. Add the main repo as `upstream`: `git remote add upstream <main-repo-url>`.
3. Create a branch for your section: `git checkout -b feature/menu`.
4. Only edit the files you own (see the table in the README). If you must change a shared file such as `global.css`, tell the team first.
5. Commit small and often, with a clear message: `add category filter to menu page`.
6. Before you push, update your branch: `git fetch upstream && git rebase upstream/main`.
7. Push and open a **pull request** into `main`. Ask a teammate to review it.
8. Merge after one approval. Delete the branch.

## Branch names
`feature/home-contact` (Member 1), `feature/menu-reservation` (Member 2), `feature/orders-admin` (Member 3)

## Code style
- 2-space indentation, single quotes in JavaScript
- Keep CSS for a page in that page's own file
- Never commit `node_modules/` or the `.db` file
