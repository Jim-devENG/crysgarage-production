from fabric import task


HOST = "209.74.80.162"
APP_DIR = "/var/www/crysgarage-deploy/audio-mastering-service"


@task
def restart_uvicorn(c):
    c.run(f"ssh root@{HOST} 'systemctl daemon-reload && systemctl restart uvicorn-audio-mastering || (pkill -f \"uvicorn main:app\" || true; cd {APP_DIR}; source venv/bin/activate; nohup uvicorn main:app --host 0.0.0.0 --port 8002 --proxy-headers >/var/log/uvicorn.log 2>&1 &)'", pty=True)


@task
def logs(c):
    c.run(f"ssh root@{HOST} 'journalctl -u uvicorn-audio-mastering -n 200 --no-pager || tail -n 200 /var/log/uvicorn.log'", pty=True)


@task
def reload_nginx(c):
    c.run(f"ssh root@{HOST} 'nginx -t && nginx -s reload'", pty=True)


@task
def health(c):
    c.run(f"ssh root@{HOST} 'curl -sf http://127.0.0.1:8002/tiers | head -c 200'", pty=True)


