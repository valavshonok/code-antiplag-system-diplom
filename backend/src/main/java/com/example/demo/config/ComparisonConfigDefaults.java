package com.example.demo.config;

import java.util.Map;
import java.util.List;

public final class ComparisonConfigDefaults {

    private ComparisonConfigDefaults() {}

    public static final Map<String, Object> COMPARISON_CONFIG = Map.of(
            "rename_variables", true,
            "remove_comments", true,
            "apply_preprocessing", true,
            "remove_using_namespace", true,
            "normalize_types", true,
            "remove_empty_lines", true,
            "format_code", true,
            "use_depersonalization", true
    );

    
    public static final Map<String, Object> IMPORT_CONFIG = Map.of(
            "import_only_OK_verdict", true,
            "remove_empty_lines", true,
            "format_code", true
    );

    public static final Map<String, Object> DEFAULT_CONFIG = Map.of(
            "comparison", COMPARISON_CONFIG,
            "import", IMPORT_CONFIG,
            "problems", List.of()
    );
}