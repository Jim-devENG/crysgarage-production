import nox


# Use the current interpreter on this machine (Windows has 3.12)


@nox.session(python="3.12")
def format(session: nox.Session) -> None:
    session.install("black", "isort")
    session.run("black", ".")
    session.run("isort", ".")

@nox.session(python="3.12")
def lint(session: nox.Session) -> None:
    session.install("ruff")
    session.run("ruff", "check", "--fix", ".")

@nox.session(python="3.12")
def types(session: nox.Session) -> None:
    session.install("mypy", "types-requests")
    session.run("mypy", "audio-mastering-service")

@nox.session(python="3.12")
def tests(session: nox.Session) -> None:
    session.install("pytest")
    session.run("pytest", "-q")


