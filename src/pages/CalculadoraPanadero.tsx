// Reemplazar DEFAULT_INGREDIENTS y otras constantes con:
const [config, setConfig] = useState<any>(null);

// Cargar configuración al montar
useEffect(() => {
  const loadConfig = async () => {
    const { data } = await supabase
      .from("tools_config")
      .select("*")
      .eq("tool_name", "calculadora_panadero")
      .single();
    if (data) {
      setConfig(data);
      setIngredients(data.default_ingredients || DEFAULT_INGREDIENTS);
    }
  };
  loadConfig();
}, []);

// También usar config.tool_name_display para el título, config.unit para unidades, config.tips para tips
