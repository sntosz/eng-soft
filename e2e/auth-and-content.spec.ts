import { test, expect } from "@playwright/test";

test.describe("Cadastro (solicitação de acesso)", () => {
  test("deve exibir o formulário e validar senhas divergentes", async ({ page }) => {
    await page.goto("/register");

    await expect(
      page.getByRole("heading", { name: /solicitar acesso/i })
    ).toBeVisible();

    await page.locator("#nome").fill("Membro Teste");
    await page.locator("#email").fill("membro.teste@unigran.br");
    await page.locator("#rgm").fill("12345678");
    await page.locator("#curso").fill("Engenharia de Software");
    await page.locator("#anoTurma").fill("2026.1");
    await page.locator("#senha").fill("senha123");
    await page.locator("#confirmaSenha").fill("senha-diferente");

    await page.getByRole("button", { name: /solicitar acesso/i }).click();

    await expect(page.locator("body")).toContainText(
      /as senhas informadas não coincidem/i
    );
  });

  test("deve validar senha fraca", async ({ page }) => {
    await page.goto("/register");

    await page.locator("#nome").fill("Membro Teste");
    await page.locator("#email").fill("membro.teste@unigran.br");
    await page.locator("#rgm").fill("12345678");
    await page.locator("#curso").fill("Engenharia de Software");
    await page.locator("#senha").fill("123");
    await page.locator("#confirmaSenha").fill("123");

    await page.getByRole("button", { name: /solicitar acesso/i }).click();

    await expect(page.locator("body")).toContainText(
      /senha deve ter no mínimo 8 caracteres/i
    );
  });
});

test.describe("Recuperação de senha", () => {
  test("deve carregar a etapa de solicitação de código", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.locator("#email")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /enviar código de verificação/i })
    ).toBeVisible();
  });

  test("deve exibir erro para e-mail não cadastrado", async ({ page }) => {
    await page.goto("/forgot-password");

    await page.locator("#email").fill("nao.existe@unigran.br");
    await page
      .getByRole("button", { name: /enviar código de verificação/i })
      .click();

    await expect(page.locator("body")).toContainText(
      /nenhuma conta encontrada|não foi possível enviar|muitas tentativas/i
    );
  });

  test("login deve ter link para a página de recuperação", async ({ page }) => {
    await page.goto("/login");

    const link = page.getByRole("link", { name: /esqueceu a senha/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });
});

test.describe("Proteção de rotas", () => {
  test("/members deve redirecionar visitante para login", async ({ page }) => {
    await page.goto("/members");
    await expect(page).toHaveURL(/\/login/);
  });

  test("/settings deve redirecionar visitante para login", async ({ page }) => {
    await page.goto("/settings");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("Conteúdo público", () => {
  test("deve carregar a página de eventos", async ({ page }) => {
    await page.goto("/events");
    await expect(
      page.getByRole("heading", { name: /eventos/i })
    ).toBeVisible();
  });

  test("deve carregar a página de partidas", async ({ page }) => {
    await page.goto("/matches");
    await expect(
      page.getByRole("heading", { name: /partidas/i })
    ).toBeVisible();
  });
});
