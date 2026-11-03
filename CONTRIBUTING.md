# Contribuir

Use branches `feat/descricao`, `fix/descricao` ou `chore/descricao` e pull requests para `main`. Commits seguem Conventional Commits:

```text
feat(downloads): add platform selection
fix(preview): preserve keyboard focus
docs: update installation instructions
```

`npm ci` configura o hook local de commitlint. O CI valida os commits dos pull requests. Configure proteção de `main` no GitHub com revisão e o check `quality` obrigatório quando houver colaboradores.

Antes de enviar:

```sh
npm run format
npm test
npm run build
```

Mudanças visuais devem ser conferidas em desktop e celular, incluindo teclado. Conteúdo deve descrever somente capacidades implementadas no app. Números ilustrativos precisam ser identificados. Adicione testes para regras de comportamento relevantes, evitando testes que apenas repitam a estrutura visual.
