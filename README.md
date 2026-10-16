# guilhermecesars.github.io

Site de portfólio pessoal de **Guilherme Cesar**, desenvolvedor de software.
Publicado via GitHub Pages em <https://guilhermecesars.github.io>.

## Sobre

Página estática (HTML, CSS e JavaScript, sem framework nem build) que reúne
quem eu sou, no que trabalho e os projetos que desenvolvi.

## Estrutura

| Arquivo / pasta        | Conteúdo                                  |
| ---------------------- | ----------------------------------------- |
| `index.html`           | Página inicial                            |
| `sobre.html`           | Página "Sobre"                            |
| `projetos/`            | Páginas de cada projeto (ex.: Garimpeiro) |
| `style.css`            | Estilos do site (visual "Prisma")         |
| `scripts.js`           | Interações (cursor, scroll horizontal, calculadora, confete) |
| `assets/`              | Imagens otimizadas (WebP)                 |

## Voltar ao design anterior

O site antes da reformulação está preservado na branch
`backup/pre-redesign-2026-10-16`. Para restaurar:

```bash
git checkout main
git checkout backup/pre-redesign-2026-10-16 -- .
git commit -am "Restaura design anterior" && git push
```

## Rodar localmente

Não há dependências. Basta abrir o `index.html` no navegador, ou servir a
pasta para os caminhos funcionarem como no ar:

```bash
python3 -m http.server 8000
```

Depois acesse <http://localhost:8000>.

## Contato

- E-mail: guyoko@gmail.com
- GitHub: [@guilhermecesars](https://github.com/guilhermecesars)
