import _ from "lodash";
import DataTable from "./DataTable/DataTable";
import { supabaseServer } from "@/utils/supabase/server";

export default async function Index() {

  const { data: cities, error, count } = await supabaseServer.from('cities')
    .select('*', {count: 'exact'})
    .range(0, 19)
    .order('uuidv4', { ascending: true })
  if (error) {
    console.error(error)
  }

  const { data: rawSchema, error: schemaError } = await supabaseServer.rpc('get_table_column_types', {
    p_schema_name: 'public',
    p_table_name: 'cities'
  })
  if (schemaError) {
    console.error(schemaError)
  }

  return (
    <div>
      <DataTable initialData={cities ?? []}
        tableSchema={rawSchema ?? []}
        total={count ?? 0}
        tableName="cities"
        textSearchField="city" />
    </div>
  );
}
