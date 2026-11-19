# Imagen del entorno de staging: el mismo servidor estático (nginx) que se usaría en producción.
FROM nginx:1.27-alpine

ARG APP_VERSION=local
ARG APP_ENV=staging

LABEL org.opencontainers.image.title="chronos-xxi" \
      org.opencontainers.image.version="${APP_VERSION}"

# La carpeta del sitio contiene espacios: se usa la forma JSON de COPY.
COPY ["PAGINA-WED-CHRONOS-XXI V2.1/", "/usr/share/nginx/html/"]

# Metadatos de versión consultados por las pruebas de humo.
RUN printf '{\n  "app": "chronos-xxi",\n  "version": "%s",\n  "environment": "%s"\n}\n' "${APP_VERSION}" "${APP_ENV}" \
      > /usr/share/nginx/html/version.json

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
