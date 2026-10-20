from app.repositories.base import Repository


class LookupRepository(Repository):
    """Reference data shown in form dropdowns. Rows are returned in table order on purpose."""

    def list_locations(self) -> list[str]:
        return [row["location"] for row in self.fetch_all("SELECT location FROM locations")]

    def list_companies(self) -> list[str]:
        return [row["company_name"] for row in self.fetch_all("SELECT company_name FROM company")]

    def company_exists(self, company_name: str) -> bool:
        return self.fetch_one("SELECT 1 FROM company WHERE company_name = %s", (company_name,)) is not None
