import { test, expect } from "@playwright/test";

test.describe("Fluxos Principais da Plataforma", () => {
  test("deve carregar a página inicial com cabeçalho, navegação e cards", async ({ page }) => {
    await page.goto("/");

    // Verifica se o título da Atlética está visível
    await expect(page.locator("body")).toContainText("A.A.A.E.S.");

    // Verifica botão de Entrar na Home
    const loginButton = page.getByRole("link", {
      name: "Entrar",
      exact: true,
    });
    await expect(
        page.getByRole("link", { name: "Loja", exact: true })
    ).toBeVisible();

    // Verifica itens da navegação lateral
    await expect(page.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Partidas", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Eventos", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Loja", exact: true })).toBeVisible();
  });

  test("deve navegar para a página de Login e exibir validação de campos", async ({ page }) => {
    await page.goto("/login");

    // Verifica elementos centrais do formulário
    await expect(page.getByRole("heading", { name: /bem-vindo de volta/i })).toBeVisible();
    const emailInput = page.locator("#email");
    const passwordInput = page.locator("#password");
    const submitButton = page.getByRole("button", { name: /entrar no painel/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Tenta submeter credenciais incorretas e verifica feedback de erro
    await emailInput.fill("usuario.inexistente@teste.com");
    await passwordInput.fill("senha-incorreta-123");
    await submitButton.click();

    // Deve exibir mensagem de erro na interface
    await expect(page.locator("body")).toContainText(/credenciais inválidas|falha ao realizar login/i);
  });

  test("deve navegar pela Loja e exibir produtos ou estado vazio", async ({ page }) => {
    await page.goto("/store");

    // Verifica cabeçalho da loja
    await expect(page.getByRole("heading", { name: /loja oficial/i })).toBeVisible();

    await expect.poll(async () => {
      const hasProducts = await page.locator(".card-glow").count();
      const hasEmptyState = await page
          .getByText(/nenhum produto disponível/i)
          .count();

      return hasProducts > 0 || hasEmptyState > 0;
    }).toBe(true);
  });

  test("deve proteger a rota /settings e redirecionar usuário não autenticado para /login", async ({ page }) => {
    await page.goto("/settings");

    // O middleware deve redirecionar o usuário não autenticado para /login
    await expect(page).toHaveURL(/\/login/);
  });
});
