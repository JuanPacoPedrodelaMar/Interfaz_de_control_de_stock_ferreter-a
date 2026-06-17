from openai import OpenAI
from pathlib import Path

client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Escribe un archivo markdown que diga: Hola desde OpenAI"
)

Path("PROJECT_DUMP.md").write_text(
    response.output_text,
    encoding="utf-8"
)

print("Archivo generado")
