package pl.gogacz.smart_helpdesk.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // Ta metoda przekierowuje wszystkie nieznane ścieżki (oprócz /api) do index.html
    // Dzięki temu odświeżanie strony w Angularze nie wyrzuca błędu 404
    @RequestMapping(value = "/{path:[^\\.]*}")
    public String redirect() {
        return "forward:/index.html";
    }
}