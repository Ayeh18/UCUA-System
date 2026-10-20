from app.repositories.base import Repository


class ReportRepository(Repository):
    def create_staff_report(
        self,
        *,
        staff_id: str,
        name: str,
        department: str,
        designation: str,
        date_time: str,
        month: str,
        location: str,
        specific_location: str,
        classification: str,
        stop_work: str,
        observation: str,
        corrective_action: str,
        image_paths: list[str],
    ) -> None:
        self.execute(
            """
            INSERT INTO data_bank (
                staff_id, name, department, designation,
                date_time, month,
                location, specific_location, observation_classification,
                call_for_stopwork, observation, corrective_action, image
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                staff_id,
                name,
                department,
                designation,
                date_time,
                month,
                location,
                specific_location,
                classification,
                stop_work,
                observation,
                corrective_action,
                image_paths,
            ),
        )

    def create_visitor_report(
        self,
        *,
        name: str,
        phone: str,
        designation: str,
        company: str,
        other_company: str,
        location: str,
        other_location: str,
        classification: str,
        stop_work: str,
        observation: str,
        action: str,
        image_paths: list[str],
        date_time: str,
        month: str,
    ) -> None:
        self.execute(
            """
            INSERT INTO data_bank_visitor (
                name, phone, designation, company, other_company, location,
                other_location, classification, stop_work, observation, action,
                image_urls, date_time, month
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                name,
                phone,
                designation,
                company,
                other_company,
                location,
                other_location,
                classification,
                stop_work,
                observation,
                action,
                image_paths,
                date_time,
                month,
            ),
        )
