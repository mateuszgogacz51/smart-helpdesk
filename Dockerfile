# Używamy lekkiego obrazu Javy 17
FROM eclipse-temurin:17-jdk-alpine

# Ustawiamy folder roboczy wewnątrz kontenera
WORKDIR /app

# Kopiujemy zbudowany plik JAR z folderu target do kontenera
# Upewnij się, że nazwa pliku pasuje do tego, co wygenerował Maven!
COPY target/smart-helpdesk-0.0.1-SNAPSHOT.jar app.jar

# Informujemy, na którym porcie działa aplikacja
EXPOSE 8080

# Komenda startowa
ENTRYPOINT ["java", "-jar", "app.jar"]