"""Gera o conjunto de dados compartilhado pelas aplicações React e Vue.

Saída (em shared/public):
  data/products.json  - 1000 produtos com dados determinísticos (seed fixa)
  img/p-0001.jpg ...  - 1000 imagens JPEG 400x400 (~20-30 KB cada)
  img/hero.jpg        - banner da página inicial (1600x600)
O seed fixo garante que as duas aplicações recebam exatamente os mesmos dados.
"""
import json, random, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

SEED = 2026
N = 1000
out = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).parent / "public"
(out / "data").mkdir(parents=True, exist_ok=True)
(out / "img").mkdir(parents=True, exist_ok=True)
rng = random.Random(SEED)

CATEGORIAS = ["Eletrônicos", "Livros", "Casa", "Esporte", "Moda", "Brinquedos", "Beleza", "Informática"]
ADJ = ["Premium", "Compacto", "Clássico", "Ultra", "Eco", "Pro", "Smart", "Essencial", "Plus", "Max"]
NOMES = ["Fone", "Cadeira", "Luminária", "Mochila", "Teclado", "Garrafa", "Relógio", "Tênis",
         "Caneca", "Livro", "Mouse", "Camiseta", "Bola", "Perfume", "Monitor", "Panela"]

def imagem(path, w, h, r):
    base = tuple(r.randint(40, 220) for _ in range(3))
    img = Image.new("RGB", (w, h), base)
    d = ImageDraw.Draw(img)
    for _ in range(60):
        x0, y0 = r.randint(-w // 4, w), r.randint(-h // 4, h)
        s = r.randint(w // 12, w // 3)
        cor = tuple(min(255, max(0, c + r.randint(-90, 90))) for c in base)
        (d.ellipse if r.random() < .5 else d.rectangle)([x0, y0, x0 + s, y0 + s], fill=cor)
    # ruído fino para aproximar o peso de uma foto real
    for _ in range(w * h // 40):
        x, y = r.randrange(w), r.randrange(h)
        img.putpixel((x, y), tuple(r.randint(0, 255) for _ in range(3)))
    img.filter(ImageFilter.SMOOTH).save(path, "JPEG", quality=80)

produtos = []
for i in range(1, N + 1):
    cat = rng.choice(CATEGORIAS)
    produtos.append({
        "id": i,
        "nome": f"{rng.choice(NOMES)} {rng.choice(ADJ)} {i}",
        "categoria": cat,
        "preco": round(rng.uniform(19.9, 2999.9), 2),
        "avaliacao": round(rng.uniform(2.5, 5.0), 1),
        "estoque": rng.randint(0, 250),
        "descricao": " ".join(rng.choice(["Produto", "durável", "leve", "resistente", "moderno",
                                           "ideal", "para", "o", "dia", "a", "uso", "com", "garantia"])
                              for _ in range(30)).capitalize() + ".",
        "imagem": f"/img/p-{i:04d}.jpg",
        "vendasMensais": [rng.randint(10, 500) for _ in range(12)],
    })
    imagem(out / "img" / f"p-{i:04d}.jpg", 400, 400, rng)

imagem(out / "img" / "hero.jpg", 1600, 600, rng)
(out / "data" / "products.json").write_text(json.dumps(produtos, ensure_ascii=False), encoding="utf-8")
total = sum(p.stat().st_size for p in (out / "img").glob("*.jpg"))
print(f"{N} produtos; imagens: {total/1024/1024:.1f} MB")
