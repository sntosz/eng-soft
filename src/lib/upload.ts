export async function uploadImage(file: File, type: "partida" | "produto" | "noticia"): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`/api/uploads?type=${type}`, {
       method: "POST",
       body: formData,
    });

    const contentType = res.headers.get("content-type");

    if (!res.ok) {
        if (contentType && contentType.includes("application/json")) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Erro ${res.status}: Falha no upload`);
        } else {
            throw new Error(`Rota /api/uploads não encontrada ou erro interno (Status ${res.status}). Verifique se src/app/api/uploads/route.ts existe.`);
        }
    }

    const data = await res.json();
    return data.url;
}