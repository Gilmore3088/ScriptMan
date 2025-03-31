"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { Trash2, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

// Define the form schema with Zod
const formSchema = z.object({
  name: z.string().min(1, "Sponsor name is required"),
  logo_url: z.string().optional(),
  brand_color: z.string().optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
  start_date: z.date().optional().nullable(),
  end_date: z.date().optional().nullable(),
  sports: z.array(z.string()).optional(),
  seasons: z.array(z.string()).optional(),
  deliverables: z
    .array(
      z.object({
        type: z.string(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        unit: z.string().optional(),
        notes: z.string().optional(),
        fulfilled: z.number().optional(),
      }),
    )
    .optional(),
})

type FormValues = z.infer<typeof formSchema>

// Define the deliverable types
const deliverableTypes = [
  "PA Read",
  "Video Board",
  "Title Sponsor",
  "Promo Booth",
  "Digital Ad",
  "Social Media",
  "Print Ad",
  "Giveaway",
  "Other",
]

// Define the unit types
const unitTypes = ["Total", "Per Game", "Per Season"]

export function SponsorForm({
  initialData,
  sports = [],
  seasons = [],
}: {
  initialData?: any
  sports?: any[]
  seasons?: any[]
}) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient<Database>()

  // Initialize the form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      logo_url: initialData?.logo_url || "",
      brand_color: initialData?.brand_color || "#000000",
      contact_name: initialData?.contact_name || "",
      contact_email: initialData?.contact_email || "",
      contact_phone: initialData?.contact_phone || "",
      notes: initialData?.notes || "",
      start_date: initialData?.start_date ? new Date(initialData.start_date) : null,
      end_date: initialData?.end_date ? new Date(initialData.end_date) : null,
      sports: initialData?.sports || [],
      seasons: initialData?.seasons || [],
      deliverables: initialData?.deliverables || [],
    },
  })

  // Add a new deliverable to the form
  const addDeliverable = () => {
    const currentDeliverables = form.getValues("deliverables") || []
    form.setValue("deliverables", [
      ...currentDeliverables,
      { type: "PA Read", quantity: 1, unit: "Total", notes: "", fulfilled: 0 },
    ])
  }

  // Remove a deliverable from the form
  const removeDeliverable = (index: number) => {
    const currentDeliverables = form.getValues("deliverables") || []
    form.setValue(
      "deliverables",
      currentDeliverables.filter((_, i) => i !== index),
    )
  }

  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      console.log("Submitting form data:", data)

      // Format dates for database
      const formattedData = {
        ...data,
        start_date: data.start_date ? data.start_date.toISOString() : null,
        end_date: data.end_date ? data.end_date.toISOString() : null,
      }

      // Insert the sponsor into the database
      const { data: sponsor, error } = await supabase.from("sponsors").insert([formattedData]).select().single()

      if (error) {
        console.error("Error creating sponsor:", error)
        throw new Error(`Error creating sponsor: ${error.message}`)
      }

      // Redirect to the sponsor page
      router.push(`/sponsors/${sponsor.id}`)
      router.refresh()
    } catch (error) {
      console.error("Error submitting form:", error)
      alert(`Error creating sponsor: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="contract">Contract Scope</TabsTrigger>
            <TabsTrigger value="fulfillment">Fulfillment Requirements</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Sponsor Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter sponsor name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="logo_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logo URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter logo URL" {...field} />
                        </FormControl>
                        <FormDescription>Enter a URL to the sponsor's logo (file upload coming soon)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Brand Color</FormLabel>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            className="w-10 h-10 rounded border"
                            value={field.value || "#000000"}
                            onChange={field.onChange}
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact email" type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact phone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter any notes about this sponsor" className="min-h-32" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contract Scope Tab */}
          <TabsContent value="contract" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="sports"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sports</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((sport) => (
                            <Badge key={sport} variant="secondary">
                              {sports.find((s) => s.id === sport)?.name || sport}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  field.onChange(field.value?.filter((s) => s !== sport))
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select
                          onValueChange={(value) => {
                            if (!field.value?.includes(value)) {
                              field.onChange([...(field.value || []), value])
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select sports" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sports.map((sport) => (
                              <SelectItem key={sport.id} value={sport.id}>
                                {sport.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seasons"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seasons</FormLabel>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {field.value?.map((season) => (
                            <Badge key={season} variant="secondary">
                              {seasons.find((s) => s.id === season)?.name || season}
                              <button
                                type="button"
                                className="ml-1 text-muted-foreground hover:text-foreground"
                                onClick={() => {
                                  field.onChange(field.value?.filter((s) => s !== season))
                                }}
                              >
                                ×
                              </button>
                            </Badge>
                          ))}
                        </div>
                        <Select
                          onValueChange={(value) => {
                            if (!field.value?.includes(value)) {
                              field.onChange([...(field.value || []), value])
                            }
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select seasons" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {seasons.map((season) => (
                              <SelectItem key={season.id} value={season.id}>
                                {season.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} className="w-full" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <DatePicker date={field.value} setDate={field.onChange} className="w-full" />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Fulfillment Requirements Tab */}
          <TabsContent value="fulfillment" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Deliverables</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addDeliverable}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Deliverable
                    </Button>
                  </div>

                  {form.watch("deliverables")?.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No deliverables added yet. Click the button above to add one.
                    </div>
                  )}

                  {form.watch("deliverables")?.map((_, index) => (
                    <div key={index} className="border rounded-md p-4 space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Deliverable {index + 1}</h4>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDeliverable(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`deliverables.${index}.type`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {deliverableTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex gap-2">
                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.quantity`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Quantity</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`deliverables.${index}.unit`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select unit" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {unitTypes.map((type) => (
                                      <SelectItem key={type} value={type}>
                                        {type}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name={`deliverables.${index}.notes`}
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel>Notes</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Enter any notes about this deliverable" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/sponsors")} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Sponsor"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

