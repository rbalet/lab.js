#
# This is the server logic of a Shiny web application. You can run the
# application by clicking 'Run App' above.
#
# Find out more about building applications with Shiny here:
#
#    http://shiny.rstudio.com/
#

library(shiny)
library(jsonlite)
library(tidyverse)
library(janitor)

# Increase maximum upload size
options(shiny.maxRequestSize = 250*1024^2)

processData <- function(datafile, labjs_column='labjs-data', skip_rows=F, skip_range=c()) {
  if (skip_rows) {
    # The header row is the first line, unless this is skipped
    header_skip <- ifelse(skip_range[1] > 1, 0, skip_range[1])
    header <- read_csv(datafile, skip=header_skip, n_max=1)
    
    # Load the remainder of the file
    data <- read_csv(datafile, skip=skip_range[2], col_names=colnames(header))
  } else {
    data <- read_csv(datafile)
  }
  
  return(
    # TODO: Consider using fread from the data.table package
    # in order to auto-detect the file format
    data %>%
      # Provide a fallback for missing data
      mutate(
        !!labjs_column := recode(.[[labjs_column]], .missing='[{}]')
      ) %>%
      # Expand JSON-encoded data per participant
      group_by_all() %>%
      do(
        fromJSON(.[[labjs_column]], flatten=T)
      ) %>%
      ungroup() %>%
      # Remove column containing raw JSON
      select(-matches(labjs_column))
  )
}

# Define server logic
shinyServer(function(input, output) {
  output$downloadData <- downloadHandler(
    filename = function() {
      paste('labjs-export-', Sys.Date(), '.csv', sep='')
    },
    content = function(con) {
      write_csv(
        processData(
          input$data_file[1, 'datapath'],
          input$data_column,
          input$skip_rows,
          input$skip_range
        ),
        con
      )
    }
  )
})